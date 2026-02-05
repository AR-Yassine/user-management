import { Routes } from '@angular/router';
import { UsersListComponent } from './pages/users-list/users-list';
import { UserDetailsComponent } from './pages/user-details/user-details';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'users' },
  { path: 'users', component: UsersListComponent },
  { path: 'users/:id', component: UserDetailsComponent },
  { path: '**', redirectTo: 'users' },
];
