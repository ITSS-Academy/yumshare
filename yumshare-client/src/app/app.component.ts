import { Component, HostBinding, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { LoadingComponent } from './components/loading/loading.component';
// import { PwaInstallComponent } from './components/pwa-install/pwa-install.component';
// import { OfflineIndicatorComponent } from './components/offline-indicator/offline-indicator.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Auth } from '@angular/fire/auth';
import { Store } from '@ngrx/store';
import { AuthState } from './ngrx/auth/auth.state';
import { AuthModel } from './models/auth.model';
import * as AuthActions from '../app/ngrx/auth/auth.actions';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from './components/snackbar/snackbar.component';
import { FooterComponent } from './components/footer/footer.component';
// import { DarkModeService } from './services/dark-mode/dark-mode.service';
import { RouteLoadingService } from './core/route-loading.service';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { SocketService } from './services/socket/socket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SideBarComponent, NavBarComponent, LoadingComponent, CommonModule, MatIconModule, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title(title: any) {
      throw new Error('Method not implemented.');
  }
  @HostBinding('class.sidebar-mini') isMini = false;
  @HostBinding('class.sidebar-closed') isClosed = false;

  isMobile = false;
  showFooter = true; // Default to show footer
  // private darkModeService = inject(DarkModeService);
  routeLoadingService = inject(RouteLoadingService);
  private routerSubscription?: Subscription;

  constructor(
    private auth: Auth,
    private store: Store<{
      auth: AuthState
    }>,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private router: Router,
    private socketService: SocketService
  ) {
    this.updateSidebarMode();
    // this.darkModeService.initSystemThemeListener();

    // Initialization logic can go here if needed
    this.auth.onAuthStateChanged(async (auth: any) => {
      if (auth) {
        // Lấy token mới nhất
        let idToken = await auth.getIdToken(true); // force refresh
        const user: AuthModel = {
          uid: auth.uid,
          displayName: auth.displayName,
          email: auth.email,
          photoURL: auth.photoURL,
          phoneNumber: auth.phoneNumber
        };

        this.store.dispatch(AuthActions.storeCurrentUser({currentUser: user, idToken: idToken}));
        this.store.dispatch(AuthActions.getMineProfile({idToken: idToken}));
        
        console.log('idToken', idToken);
        // Hiển thị snackbar chỉ khi chưa từng hiển thị trong session này
        if (!localStorage.getItem('loginSnackbarShown')) {
          this._snackBar.openFromComponent(SnackbarComponent, {
            duration: 3000,
            panelClass: ['success-snackbar'],
            data: {
              message: 'Login successful!',
              icon: 'check_circle'
            }
          });
          localStorage.setItem('loginSnackbarShown', 'true');
        }

        // Setup token refresh
        this.setupTokenRefresh(auth);
        
        // Connect to socket and join user rooms
        this.socketService.connect();
        
        // Wait a bit for connection to establish before joining rooms
        setTimeout(() => {
          this.socketService.joinUserRoom(auth.uid); // For notifications
          this.socketService.joinChatRoom(auth.uid); // For chat
        }, 1000);
      } else {
        // Xoá flag khi logout để lần sau login lại sẽ hiện
        localStorage.removeItem('loginSnackbarShown');
        // Dispatch clearAuthState để clear hoàn toàn auth state
        this.store.dispatch(AuthActions.clearAuthState());
        // Đóng tất cả dialog nếu có
        this.dialog.closeAll();
        
        // Disconnect from socket
        this.socketService.disconnect();
      }
    });
  }

  ngOnInit(): void {
    this.checkScreenSize();
    this.setupRouterListener();
    // Dark mode is already initialized in constructor
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.updateSidebarMode();
  }

  private updateSidebarMode() {
    this.isMobile = window.innerWidth <= 767; // Changed from < 768 to <= 767

    if (this.isMobile) {
      // mobile mặc định đóng sidebar
      this.isMini = false;
      this.isClosed = true;
    } else {
      // desktop mặc định full sidebar
      this.isClosed = false;
      this.isMini = false;
    }
  }

  private setupRouterListener() {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateFooterVisibility();
      });
  }

  private updateFooterVisibility() {
    const currentRoute = this.router.url;

    // Routes where footer should NOT be shown
    const noFooterRoutes = [
      '/message',
      '/profile',
      '/add-recipe',
      '/edit-recipe'
    ];

    // Check if current route matches any no-footer routes
    this.showFooter = !noFooterRoutes.some(route =>
      currentRoute.includes(route)
    );
  }

  private setupTokenRefresh(auth: any) {
    // Refresh token trước khi hết hạn (mỗi 50 phút)
    setInterval(async () => {
      try {
        const newToken = await auth.getIdToken(true);
        this.store.dispatch(AuthActions.storeCurrentUser({
          currentUser: {
            uid: auth.uid,
            displayName: auth.displayName,
            email: auth.email,
            photoURL: auth.photoURL,
            phoneNumber: auth.phoneNumber
          },
          idToken: newToken
        }));
      } catch (error) {
        console.error('❌ Error refreshing token:', error);
      }
    }, 50 * 60 * 1000); // 50 phút
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.isClosed = !this.isClosed; // mobile: dạng drawer
    } else {
      this.isMini = !this.isMini;     // desktop: toggle mini
    }
  }

  closeSidebarOnBackdrop() {
    if (this.isMobile) {
      this.isClosed = true;
    }
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 767; // Changed from <= 768 to <= 767

    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 767; // Changed from <= 768 to <= 767
    });
  }

  isMessagePage(): boolean {
    return this.router.url.includes('/message');
  }
}
