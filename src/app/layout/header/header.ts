import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../core/services/users.service';
import { ApiUser } from '../../core/models/user.models';
import {
  BehaviorSubject,
  Observable,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  of,
  catchError,
} from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from '../../core/loading/loading.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, MatProgressBarModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private usersService = inject(UsersService);
  private router = inject(Router);
  loading = inject(LoadingService);

  search = '';
  private search$ = new BehaviorSubject<string>('');

  results$: Observable<ApiUser[]> = this.search$.pipe(
    debounceTime(250),
    distinctUntilChanged(),
    map(v => v.trim()),
    switchMap(term => {
      if (!term) return of([] as ApiUser[]);


      const id = Number(term);
      if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
        return of([] as ApiUser[]);
      }


      return this.usersService.getUserByIdApi(id).pipe(
        map(u => (u ? [u] : [])),
        catchError(() => of([] as ApiUser[]))
      );
    })
  );

  onSearchChange(v: string) {
    this.search$.next(v);
  }

  openUser(u: ApiUser) {
    this.search = '';
    this.search$.next('');
    this.router.navigate(['/users', u.id]);
  }
}
