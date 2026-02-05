import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, switchMap, shareReplay, map } from 'rxjs';
import { UsersService } from '../../core/services/users.service';
import { ApiUser } from '../../core/models/user.models';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatPaginatorModule],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersListComponent {
  private page$ = new BehaviorSubject<number>(1);

  readonly pageData$ = this.page$.pipe(
    switchMap((p) => this.usersService.getUsersPage(p)),
    shareReplay(1)
  );

  readonly users$ = this.pageData$.pipe(map((res) => res.data));
  readonly total$ = this.pageData$.pipe(map((res) => res.total));
  readonly perPage$ = this.pageData$.pipe(map((res) => res.per_page));
  readonly pageIndex$ = this.pageData$.pipe(map((res) => res.page - 1));

  constructor(private usersService: UsersService, private router: Router) {}

  onPageChange(e: PageEvent) {
    this.page$.next(e.pageIndex + 1);
  }

  openUser(u: ApiUser) {
    this.router.navigate(['/users', u.id]);
  }
}
