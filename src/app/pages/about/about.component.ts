import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * About page component
 * Provides information about the project, technology, and algorithms
 */
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  public readonly githubUrl =
    'https://github.com/your-username/angular-bhp-simulator';
  public readonly docsUrl = '/docs';
  public readonly currentYear = new Date().getFullYear();

  public readonly technologies = [
    { name: 'Angular', version: '21.x', icon: 'web' },
    { name: 'Angular Material', version: '21.x', icon: 'palette' },
    { name: 'ECharts', version: '6.x', icon: 'show_chart' },
    { name: 'RxJS', version: '7.x', icon: 'stream' },
    { name: 'TypeScript', version: '5.x', icon: 'code' },
    { name: 'Nx', version: '22.x', icon: 'build' },
  ];

  public readonly features = [
    {
      title: 'Real-Time Simulation',
      description: 'Simulates streaming data with configurable patterns and speeds',
      icon: 'speed',
    },
    {
      title: 'BHP Calculation',
      description:
        'Implements backward-looking incremental algorithm for bottomhole pressure',
      icon: 'calculate',
    },
    {
      title: 'Interactive Charts',
      description: 'Responsive ECharts visualizations with multiple series support',
      icon: 'show_chart',
    },
    {
      title: 'Theme Support',
      description: 'Dark and light themes with automatic system preference detection',
      icon: 'dark_mode',
    },
    {
      title: 'Modular Architecture',
      description: 'Built with Nx workspace and reusable library components',
      icon: 'architecture',
    },
    {
      title: 'Zero Backend',
      description: 'All simulation logic runs client-side in the browser',
      icon: 'cloud_off',
    },
  ];

  /**
   * Open GitHub repository
   */
  public openGithub(): void {
    window.open(this.githubUrl, '_blank');
  }

  /**
   * Open documentation
   */
  public openDocs(): void {
    window.open(this.docsUrl, '_blank');
  }
}
