import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-page-error',
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './page-error.component.html',
  styleUrl: './page-error.component.scss'
})
export class PageErrorComponent implements OnInit {
  errorCode = '404';
  errorTitle = 'Page Not Found';
  errorMessage = 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.';
  
  // Different error types
  errorTypes: { [key: string]: { code: string; title: string; message: string; icon: string } } = {
    '404': {
      code: '404',
      title: 'Page Not Found',
      message: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
      icon: 'search_off'
    },
    '500': {
      code: '500',
      title: 'Server Error',
      message: 'Something went wrong on our end. We are working to fix this issue. Please try again later.',
      icon: 'error_outline'
    },
    '403': {
      code: '403',
      title: 'Access Denied',
      message: 'You do not have permission to access this resource. Please contact your administrator.',
      icon: 'block'
    }
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Get error code from route params
    this.route.params.subscribe(params => {
      const code = params['code'] || '404';
      // Check if code exists in errorTypes, otherwise default to 404
      if (code in this.errorTypes) {
        this.setErrorType(code);
      } else {
        this.setErrorType('404');
      }
    });
  }

  setErrorType(type: string) {
    const error = this.errorTypes[type];
    this.errorCode = error.code;
    this.errorTitle = error.title;
    this.errorMessage = error.message;
  }

  getErrorIcon(): string {
    const error = this.errorTypes[this.errorCode];
    return error?.icon || 'error_outline';
  }

  goBack(): void {
    window.history.back();
  }
}
