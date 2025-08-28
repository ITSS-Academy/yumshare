import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { ShareModule } from "../../shares/share.module";
@Component({
  selector: 'app-snackbar',
  imports: [ShareModule],
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.scss'
})
export class SnackbarComponent {
constructor(
    public snackBarRef: MatSnackBarRef<SnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: { message: string, icon: string }
  ) {}

  close() {
    this.snackBarRef.dismiss();
  }
}
