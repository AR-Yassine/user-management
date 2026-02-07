import { ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject, Subscription, combineLatest, map, shareReplay } from 'rxjs';
import { Router } from '@angular/router';

import { UsersService } from '../../core/services/users.service';
import { ApiUser } from '../../core/models/user.models';

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatIconModule],
  templateUrl: './users-table.html',
  styleUrl: './users-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersTableComponent implements OnDestroy {
  private usersService = inject(UsersService);
  private router = inject(Router);

  displayedColumns: string[] = ['avatar', 'id', 'name', 'email', 'phone', 'actions'];

  private pageIndex$ = new BehaviorSubject<number>(0);
  private pageSize$ = new BehaviorSubject<number>(15);

  private sub = new Subscription();


  private allUsers$ = this.usersService.getAllUsers().pipe(shareReplay(1));


  private latestUsers: ApiUser[] = [];

  modal: { open: boolean; mode: 'add' | 'edit'; title: string } = {
    open: false,
    mode: 'add',
    title: 'Add User',
  };

  form: {
    id?: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar: string;
    phone?: string;
  } = {
    first_name: '',
    last_name: '',
    email: '',
    avatar: '',
    phone: '',
  };

  constructor() {
    this.sub.add(
      this.allUsers$.subscribe((users) => {
        this.latestUsers = users ?? [];
      })
    );
  }

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

  openAdd(): void {
    this.modal = { open: true, mode: 'add', title: 'Add User' };
    this.form = { first_name: '', last_name: '', email: '', avatar: '', phone: '' };
  }

  openUser(u: ApiUser): void {
    this.router.navigate(['/users', u.id]);
  }

  openEdit(u: ApiUser): void {
    this.modal = { open: true, mode: 'edit', title: 'Edit User' };
    this.form = {
      id: u.id,
      first_name: u.first_name ?? '',
      last_name: u.last_name ?? '',
      email: u.email ?? '',
      avatar: u.avatar ?? '',
      phone: (u as any).phone ?? (u as any).phone_number ?? (u as any).phoneNumber ?? '',
    };
  }

  closeModal(): void {
    this.modal.open = false;
  }

  saveModal(): void {
    const current = this.latestUsers;

    if (!this.form.first_name.trim() || !this.form.last_name.trim() || !this.form.email.trim()) return;

    if (this.modal.mode === 'add') {
      const nextId = current.length ? Math.max(...current.map((u) => u.id)) + 1 : 1;

      const newUser: ApiUser = {
        id: nextId,
        first_name: this.form.first_name.trim(),
        last_name: this.form.last_name.trim(),
        email: this.form.email.trim(),
        avatar: this.form.avatar.trim() || 'https://i.pravatar.cc/150?img=1',
        ...(this.form.phone?.trim() ? { phone: this.form.phone.trim() } : {}),
      } as any;


      this.usersService.addUser(newUser);


      const pageSize = this.pageSize$.getValue();
      const lastPageIndex = Math.max(0, Math.ceil((current.length + 1) / pageSize) - 1);
      this.pageIndex$.next(lastPageIndex);
    } else {
      const id = this.form.id;
      if (id == null) return;

      const old = current.find((u) => u.id === id);
      if (!old) return;

      const updatedUser: ApiUser = {
        ...old,
        first_name: this.form.first_name.trim(),
        last_name: this.form.last_name.trim(),
        email: this.form.email.trim(),
        avatar: this.form.avatar.trim() || old.avatar,
        ...(this.form.phone?.trim() ? { phone: this.form.phone.trim() } : { phone: '' }),
      } as any;

      // ✅ update via service
      this.usersService.updateUser(updatedUser);
    }

    this.closeModal();
  }

  remove(id: number): void {
    const ok = window.confirm('Delete this user?');
    if (!ok) return;


    this.usersService.deleteUser(id);


    const nextLen = this.latestUsers.length - 1;
    const pageSize = this.pageSize$.getValue();
    const maxPageIndex = Math.max(0, Math.ceil(nextLen / pageSize) - 1);
    const safeIndex = Math.min(this.pageIndex$.getValue(), maxPageIndex);
    this.pageIndex$.next(safeIndex);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getPhone(u: ApiUser): string {
    return (
      (u as any).phone ||
      (u as any).phone_number ||
      (u as any).phoneNumber ||
      '-'
    );
  }
}
