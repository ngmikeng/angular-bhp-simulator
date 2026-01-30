import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ThemeService } from './shared/services/theme.service';
import { ErrorService } from './shared/services/error.service';

@Component({
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'BHP Real-Time Simulator';
  public isDarkTheme = false;

  constructor(
    private theme: ThemeService,
    private errorService: ErrorService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to theme changes
    this.theme.isDarkMode$.subscribe((isDark) => {
      this.isDarkTheme = isDark;
    });

    // Subscribe to error messages
    this.errorService.errorStream$.subscribe((error) => {
      const config = {
        duration: error.type === 'error' ? 5000 : 3000,
        horizontalPosition: 'end' as const,
        verticalPosition: 'top' as const,
        panelClass: [`snackbar-${error.type}`],
      };
      this.snackBar.open(error.message, 'Close', config);
    });
  }

  /**
   * Toggle theme between light and dark
   */
  public toggleTheme(): void {
    this.theme.toggleTheme();
  }

  /**
   * Navigate to dashboard
   */
  public navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Navigate to about page
   */
  public navigateToAbout(): void {
    this.router.navigate(['/about']);
  }

  /**
   * Get theme icon
   */
  public getThemeIcon(): string {
    return this.isDarkTheme ? 'light_mode' : 'dark_mode';
  }

  /**
   * Get theme tooltip
   */
  public getThemeTooltip(): string {
    return this.isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme';
  }
}
