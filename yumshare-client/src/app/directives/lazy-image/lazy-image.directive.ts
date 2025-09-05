import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { ImageOptimizationService, OptimizedImage } from '../../services/image-optimization/image-optimization.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appLazyImage]',
  standalone: true
})
export class LazyImageDirective implements OnInit, OnDestroy {
  @Input() appLazyImage!: string;
  @Input() appLazyImageOptions: any = {};
  @Input() appLazyImagePriority: boolean = false;

  private intersectionObserver?: IntersectionObserver;
  private subscription = new Subscription();
  private imgElement?: HTMLImageElement;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private imageOptimization: ImageOptimizationService
  ) {}

  ngOnInit(): void {
    this.setupLazyLoading();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private setupLazyLoading(): void {
    if (this.appLazyImagePriority) {
      // Load immediately for priority images
      this.loadImage();
    } else {
      // Setup intersection observer for lazy loading
      this.setupIntersectionObserver();
    }
  }

  private setupIntersectionObserver(): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      this.loadImage();
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage();
            this.intersectionObserver?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before entering viewport
        threshold: 0.1
      }
    );

    this.intersectionObserver.observe(this.el.nativeElement);
  }

  private loadImage(): void {
    if (!this.appLazyImage) return;

    // Get optimized image URLs
    const optimizedImage = this.imageOptimization.optimizeImageUrl(
      this.appLazyImage, 
      this.appLazyImageOptions
    );

    // Create image element
    this.imgElement = this.renderer.createElement('img');
    
    // Set attributes
    this.renderer.setAttribute(this.imgElement, 'loading', 'lazy');
    this.renderer.setAttribute(this.imgElement, 'alt', 'Lazy loaded image');
    
    // Set placeholder first
    if (optimizedImage.placeholder) {
      this.renderer.setAttribute(this.imgElement, 'src', optimizedImage.placeholder);
    }

    // Add loading class
    this.renderer.addClass(this.imgElement, 'lazy-image-loading');

    // Setup progressive loading
    this.setupProgressiveLoading(optimizedImage);

    // Replace element content
    this.renderer.setProperty(this.el.nativeElement, 'innerHTML', '');
    this.renderer.appendChild(this.el.nativeElement, this.imgElement);
  }

  private setupProgressiveLoading(optimizedImage: OptimizedImage): void {
    if (!this.imgElement) return;

    // Load thumbnail first
    if (optimizedImage.thumbnail) {
      this.loadImageWithFallback(optimizedImage.thumbnail, () => {
        // After thumbnail loads, load optimized version
        if (optimizedImage.optimized) {
          this.loadImageWithFallback(optimizedImage.optimized, () => {
            // Image fully loaded
            this.renderer.removeClass(this.imgElement, 'lazy-image-loading');
            this.renderer.addClass(this.imgElement, 'lazy-image-loaded');
          });
        }
      });
    } else if (optimizedImage.optimized) {
      // No thumbnail, load optimized directly
      this.loadImageWithFallback(optimizedImage.optimized, () => {
        this.renderer.removeClass(this.imgElement, 'lazy-image-loading');
        this.renderer.addClass(this.imgElement, 'lazy-image-loaded');
      });
    } else {
      // Fallback to original
      this.loadImageWithFallback(optimizedImage.original, () => {
        this.renderer.removeClass(this.imgElement, 'lazy-image-loading');
        this.renderer.addClass(this.imgElement, 'lazy-image-loaded');
      });
    }
  }

  private loadImageWithFallback(url: string, onLoad?: () => void): void {
    if (!this.imgElement) return;

    const img = new Image();
    
    img.onload = () => {
      this.renderer.setAttribute(this.imgElement, 'src', url);
      onLoad?.();
    };

    img.onerror = () => {
      // Fallback to original if optimized fails
      if (url !== this.appLazyImage) {
        this.renderer.setAttribute(this.imgElement, 'src', this.appLazyImage);
      }
      onLoad?.();
    };

    img.src = url;
  }

  private cleanup(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    this.subscription.unsubscribe();
  }
}
