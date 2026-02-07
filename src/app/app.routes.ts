import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent) },

      { path: 'users/list', loadComponent: () => import('./pages/users-list/users-list').then(m => m.UsersListComponent) },
      { path: 'users/table', loadComponent: () => import('./pages/users-table/users-table').then(m => m.UsersTableComponent) },

      { path: 'users/:id', loadComponent: () => import('./pages/user-details/user-details').then(m => m.UserDetailsComponent) },

      { path: 'reviews', loadComponent: () => import('./pages/reviews/reviews').then(m => m.ReviewsComponent) },
      { path: 'about', loadComponent: () => import('./pages/about/about').then(m => m.AboutComponent) },
      { path: 'contact', loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent) },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
];
