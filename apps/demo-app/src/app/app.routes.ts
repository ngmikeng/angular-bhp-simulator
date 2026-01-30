import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/dashboard/about.component').then((m) => m.AboutComponent),
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
