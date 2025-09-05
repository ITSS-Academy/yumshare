import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, debounceTime } from 'rxjs';

export interface VirtualScrollItem {
  id: string | number;
  [key: string]: any;
}

export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  bufferSize: number;
  debounceTime: number;
}

@Component({
  selector: 'app-virtual-scroll',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="virtual-scroll-container" 
         [style.height.px]="options.containerHeight"
         (scroll)="onScroll($event)"
         #scrollContainer>
      
      <div class="virtual-scroll-spacer" 
           [style.height.px]="totalHeight">
      </div>
      
      <div class="virtual-scroll-content" 
           [style.transform]="'translateY(' + offsetY + 'px)'">
        
        <div *ngFor="let item of visibleItems; trackBy: trackByFn"
             class="virtual-scroll-item"
             [style.height.px]="options.itemHeight">
          
          <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: item, index: getItemIndex(item) }">
          </ng-container>
          
        </div>
        
      </div>
      
    </div>
  `,
  styles: [`
    .virtual-scroll-container {
      overflow-y: auto;
      position: relative;
      border: 1px solid #ddd;
    }
    
    .virtual-scroll-spacer {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      pointer-events: none;
    }
    
    .virtual-scroll-content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    }
    
    .virtual-scroll-item {
      border-bottom: 1px solid #eee;
      padding: 8px;
      box-sizing: border-box;
    }
    
    .virtual-scroll-item:hover {
      background-color: #f5f5f5;
    }
  `]
})
export class VirtualScrollComponent<T extends VirtualScrollItem> implements OnInit, OnDestroy {
  @Input() items: T[] = [];
  @Input() itemTemplate!: any;
  @Input() options: VirtualScrollOptions = {
    itemHeight: 60,
    containerHeight: 400,
    bufferSize: 5,
    debounceTime: 16
  };
  
  @Output() itemVisible = new EventEmitter<T>();
  @Output() scrollEnd = new EventEmitter<void>();

  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef;

  visibleItems: T[] = [];
  offsetY = 0;
  totalHeight = 0;
  
  private scrollSubject = new Subject<Event>();
  private destroy$ = new Subject<void>();
  private startIndex = 0;
  private endIndex = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.setupScrollHandler();
    this.updateVisibleItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setup scroll event handler with debouncing
   */
  private setupScrollHandler(): void {
    this.scrollSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(this.options.debounceTime)
    ).subscribe(() => {
      this.updateVisibleItems();
      this.cdr.detectChanges();
    });
  }

  /**
   * Handle scroll events
   */
  onScroll(event: Event): void {
    this.scrollSubject.next(event);
    
    // Check if reached end
    const element = event.target as HTMLElement;
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 10) {
      this.scrollEnd.emit();
    }
  }

  /**
   * Update visible items based on scroll position
   */
  private updateVisibleItems(): void {
    if (!this.items.length) return;

    const scrollTop = this.scrollContainer.nativeElement.scrollTop;
    const containerHeight = this.options.containerHeight;
    const itemHeight = this.options.itemHeight;
    const bufferSize = this.options.bufferSize;

    // Calculate visible range
    this.startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
    this.endIndex = Math.min(
      this.items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize
    );

    // Update visible items
    this.visibleItems = this.items.slice(this.startIndex, this.endIndex + 1);
    
    // Calculate offset for positioning
    this.offsetY = this.startIndex * itemHeight;
    
    // Update total height
    this.totalHeight = this.items.length * itemHeight;

    // Emit visible items
    this.visibleItems.forEach(item => {
      this.itemVisible.emit(item);
    });
  }

  /**
   * Get item index for template context
   */
  getItemIndex(item: T): number {
    return this.items.findIndex(i => i.id === item.id);
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByFn(index: number, item: T): string | number {
    return item.id;
  }

  /**
   * Scroll to specific item
   */
  scrollToItem(itemId: string | number): void {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      const scrollTop = index * this.options.itemHeight;
      this.scrollContainer.nativeElement.scrollTop = scrollTop;
    }
  }

  /**
   * Scroll to top
   */
  scrollToTop(): void {
    this.scrollContainer.nativeElement.scrollTop = 0;
  }

  /**
   * Scroll to bottom
   */
  scrollToBottom(): void {
    this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
  }

  /**
   * Update items and refresh view
   */
  updateItems(newItems: T[]): void {
    this.items = newItems;
    this.updateVisibleItems();
    this.cdr.detectChanges();
  }

  /**
   * Get current scroll position
   */
  getScrollPosition(): { scrollTop: number; scrollHeight: number; clientHeight: number } {
    const element = this.scrollContainer.nativeElement;
    return {
      scrollTop: element.scrollTop,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight
    };
  }

  /**
   * Check if item is visible
   */
  isItemVisible(itemId: string | number): boolean {
    const index = this.items.findIndex(item => item.id === itemId);
    return index >= this.startIndex && index <= this.endIndex;
  }
}
