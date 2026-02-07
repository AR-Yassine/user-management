import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject, combineLatest, map, shareReplay } from 'rxjs';
import { Router } from '@angular/router';

import { UsersService } from '../../core/services/users.service';
import { ApiUser } from '../../core/models/user.models';

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatIconModule],
  templateUrl: './users-table.html',
  styleUrl: './users-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersTableComponent {
  private usersService = inject(UsersService);
  private router = inject(Router);

  displayedColumns: string[] = ['avatar', 'id', 'name', 'email', 'actions'];

  private pageIndex$ = new BehaviorSubject<number>(0);
  private pageSize$ = new BehaviorSubject<number>(15);

  private allUsers$ = this.usersService.getAllUsers().pipe(shareReplay(1));

  vm$ = combineLatest([this.allUsers$, this.pageIndex$, this.pageSize$]).pipe(
    map(([all, pageIndex, pageSize]) => {
      const start = pageIndex * pageSize;
      return {
        users: all.slice(start, start + pageSize),
        total: all.length,
        pageIndex,
        pageSize,
      };
    }),
    shareReplay(1)
  );

  onPageChange(e: PageEvent): void {
    this.pageIndex$.next(e.pageIndex);
    this.pageSize$.next(e.pageSize);
  }

  openAdd(): void { console.log('openAdd()'); }
  openUser(u: ApiUser): void { this.router.navigate(['/users', u.id]); }
  openEdit(u: ApiUser): void { console.log('openEdit()', u); }
  remove(id: number): void { console.log('remove()', id); }
}
