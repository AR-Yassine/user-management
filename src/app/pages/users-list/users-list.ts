import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import { BehaviorSubject, combineLatest, map, shareReplay, switchMap } from 'rxjs';
import { UsersService } from '../../core/services/users.service';
import { ApiUser } from '../../core/models/user.models';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatPaginatorModule,
    MatButtonToggleModule,
    MatTableModule,
  ],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersListComponent {

  readonly cardsPageSize = 12;
  private pageIndex$ = new BehaviorSubject<number>(0);
  private pageSize$ = new BehaviorSubject<number>(this.cardsPageSize);

  readonly users$;
  readonly total$;
  readonly pageIndexView$ = this.pageIndex$.asObservable();
  readonly pageSizeView$ = this.pageSize$.asObservable();

  displayedColumns: string[] = ['avatar', 'id', 'name', 'email', 'actions'];

  constructor(private usersService: UsersService, private router: Router) {
    const allUsers$ = this.usersService.getAllUsers().pipe(shareReplay(1));

    this.total$ = allUsers$.pipe(map(users => users.length));

    this.users$ = combineLatest([
      allUsers$,
      this.pageIndex$,
      this.pageSize$
    ]).pipe(
      map(([all, pageIndex, pageSize]) => {
        const start = pageIndex * pageSize;
        return all.slice(start, start + pageSize);
      }),
      shareReplay(1)
    );
  }


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
