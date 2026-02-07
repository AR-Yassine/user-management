import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, combineLatest, map, shareReplay } from 'rxjs';
import { UsersService } from '../../core/services/users.service';
import { ApiUser } from '../../core/models/user.models';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatPaginatorModule],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent {
  private usersService = inject(UsersService);
  private router = inject(Router);

  readonly pageSize = 12;

  private pageIndex$ = new BehaviorSubject<number>(0);
  readonly pageIndexView$ = this.pageIndex$.asObservable();
  readonly pageSizeView$ = new BehaviorSubject<number>(this.pageSize);

  private allUsers$ = this.usersService.getAllUsers().pipe(shareReplay(1));

  readonly total$ = this.allUsers$.pipe(
    map(users => users.length),
    shareReplay(1)
  );

  readonly users$ = combineLatest([this.allUsers$, this.pageIndex$]).pipe(
    map(([all, pageIndex]) => {
      const start = pageIndex * this.pageSize;
      return all.slice(start, start + this.pageSize);
    }),
    shareReplay(1)
  );

  onPageChange(e: PageEvent) {
    this.pageIndex$.next(e.pageIndex);
  }

  openUser(u: ApiUser) {
    this.router.navigate(['/users', u.id]);
  }

  trackById(_: number, u: ApiUser) {
    return u.id;
  }
}
