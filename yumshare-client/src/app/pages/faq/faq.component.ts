import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-faq',
  imports: [
    MatButton,
    MatInput,
    FormsModule // Thêm dòng này để dùng được ngModel
  ],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  showSuccess = false;
  name = '';
  email = '';
  phone = '';
  message = '';
  get isFormValid(): boolean {
    return !!this.name && !!this.email && !!this.phone && !!this.message;
  }
  onSubmit() {
    this.showSuccess = true;
    setTimeout(() => this.showSuccess = false, 2500); // Ẩn sau 2.5s
  }
}