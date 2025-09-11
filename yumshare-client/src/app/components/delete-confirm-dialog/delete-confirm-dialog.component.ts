import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-delete-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  styleUrl: './delete-confirm-dialog.component.scss',
  template: `
    <h2 mat-dialog-title>{{ data?.title || 'Confirm Delete' }}</h2>
    <mat-dialog-content>
      {{ data?.message || 'Are you sure you want to delete this item? This action cannot be undone.' }}
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">{{ data?.cancelText || 'Cancel' }}</button>
      <button mat-raised-button class="delete-btn" [mat-dialog-close]="true">{{ data?.confirmText || 'Delete' }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .delete-btn {
      background-color: #f44336 !important;
      color: white !important;
    }
    .delete-btn:hover {
      background-color: #d32f2f !important;
    }
  `]
})
export class DeleteConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
