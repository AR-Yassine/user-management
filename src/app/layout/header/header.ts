import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../core/services/users.service';
import { ApiUser } from '../../core/models/user.models';
import { BehaviorSubject, combineLatest, debounceTime, map, shareReplay } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private usersService = inject(UsersService);
  private router = inject(Router);

  search = '';
  private search$ = new BehaviorSubject<string>('');

  users$ = this.usersService.getAllUsers().pipe(shareReplay(1));

  results$ = combineLatest([
    this.users$,
    this.search$.pipe(debounceTime(200)),
  ]).pipe(
    map(([users, term]) => {
      const q = term.trim().toLowerCase();
      if (!q) return [];

      return users.filter(u =>
        u.id.toString().includes(q) ||
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
        (u.phone ?? '').toLowerCase().includes(q)
      ).slice(0, 6); // limit results
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
