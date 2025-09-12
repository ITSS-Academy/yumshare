import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-faq',
  imports: [
    MatButton,
    MatInput,
    FormsModule,
    TranslatePipe
  ],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
  @ViewChild('containerRight', { static: true }) containerRight!: ElementRef;

  showSuccess = false;
  name = '';
  email = '';
  phone = '';
  message = '';

  constructor(
    private translate: TranslateService,
    private renderer: Renderer2
  ) {}

  setFaqHoverTexts() {
    this.translate.get([
      'faq_hover_1',
      'faq_hover_2',
      'faq_hover_3',
      'faq_hover_4'
    ]).subscribe(res => {
      document.documentElement.style.setProperty('--faq-hover-1', `"${res['faq_hover_1']}"`);
      document.documentElement.style.setProperty('--faq-hover-2', `"${res['faq_hover_2']}"`);
      document.documentElement.style.setProperty('--faq-hover-3', `"${res['faq_hover_3']}"`);
      document.documentElement.style.setProperty('--faq-hover-4', `"${res['faq_hover_4']}"`);
    });
  }

  get isFormValid(): boolean {
    return !!this.name && !!this.email && !!this.phone && !!this.message;
  }

  onSubmit() {
    this.showSuccess = true;
    setTimeout(() => this.showSuccess = false, 2500);
  }

  updateLangClass() {
    if (this.containerRight) {
      if (this.translate.currentLang === 'vi') {
        this.renderer.addClass(this.containerRight.nativeElement, 'lang-vi');
      } else {
        this.renderer.removeClass(this.containerRight.nativeElement, 'lang-vi');
      }
    }
  }

  ngOnInit() {
    this.setFaqHoverTexts();
    this.updateLangClass();
    this.translate.onLangChange.subscribe(() => {
      this.setFaqHoverTexts();
      this.updateLangClass();
    });
  }
}