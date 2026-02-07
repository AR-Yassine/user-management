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

type Gender = 'Male' | 'Female' | '';

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

  // ✅ show validation message in UI
  formError = '';

  // ✅ for <input type="date" [max]="maxDob">
  get maxDob(): string {
    // allow DOB up to today (no future)
    const d = new Date();
    return d.toISOString().slice(0, 10); // yyyy-mm-dd
  }

  // optional list (if you prefer *ngFor). If you hardcode options, you can remove it.
  genders: Array<'Male' | 'Female'> = ['Male', 'Female'];

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
    dob?: string;
    gender?: Gender;
  } = {
    first_name: '',
    last_name: '',
    email: '',
    avatar: '',
    phone: '',
    dob: '',
    gender: '',
  };

  constructor() {
    this.sub.add(
      this.allUsers$.subscribe((users: ApiUser[]) => {
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
    this.formError = '';
    this.modal = { open: true, mode: 'add', title: 'Add User' };
    this.form = {
      first_name: '',
      last_name: '',
      email: '',
      avatar: '',
      phone: '',
      dob: '',
      gender: '',
    };
  }

  openUser(u: ApiUser): void {
    this.router.navigate(['/users', u.id]);
  }

  openEdit(u: ApiUser): void {
    this.formError = '';
    this.modal = { open: true, mode: 'edit', title: 'Edit User' };
    this.form = {
      id: u.id,
      first_name: u.first_name ?? '',
      last_name: u.last_name ?? '',
      email: u.email ?? '',
      avatar: u.avatar ?? '',
      phone: (u as any).phone ?? (u as any).phone_number ?? (u as any).phoneNumber ?? '',
      dob: (u as any).dob ?? '',
      gender: ((u as any).gender ?? '') as Gender,
    };
  }

  closeModal(): void {
    this.modal.open = false;
  }

  private getAge(dob?: string): number | null {
    if (!dob) return null;

    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return null;

    const today = new Date();

    // ✅ if dob is in the future, invalid
    if (birth.getTime() > today.getTime()) return null;

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    // ✅ enforce min age 15
    if (age < 15) return null;

    return age;
  }

  saveModal(): void {
    this.formError = '';

    const current = this.latestUsers;

    const first = this.form.first_name.trim();
    const last = this.form.last_name.trim();
    const email = this.form.email.trim();
    if (!first || !last || !email) {
      this.formError = 'First name, last name, and email are required.';
      return;
    }

    const phone = (this.form.phone ?? '').trim();
    const dob = (this.form.dob ?? '').trim();
    const gender = ((this.form.gender ?? '').trim() as Gender) || '';

    // ✅ validate DOB if provided
    if (dob) {
      const age = this.getAge(dob);
      if (age === null) {
        this.formError = 'Date of birth must be valid and age must be 15+.';
        return;
      }
    }

    if (this.modal.mode === 'add') {
      const nextId = current.length ? Math.max(...current.map((u) => u.id)) + 1 : 1;

      const newUser: ApiUser = {
        id: nextId,
        first_name: first,
        last_name: last,
        email,
        avatar: this.form.avatar.trim() || 'https://i.pravatar.cc/150?img=1',
        ...(phone ? { phone } : {}),
        ...(dob ? { dob } : {}),
        ...(gender ? { gender } : {}),
      } as any;

      this.usersService.addUser(newUser);

      const pageSize = this.pageSize$.getValue();
      const lastPageIndex = Math.max(0, Math.ceil((current.length + 1) / pageSize) - 1);
      this.pageIndex$.next(lastPageIndex);

      this.closeModal();
      this.router.navigate(['/users', nextId]);
      return;
    }

    // edit mode
    const id = this.form.id;
    if (id == null) return;

    const old = current.find((u) => u.id === id);
    if (!old) return;

    const updatedUser: ApiUser = {
      ...old,
      first_name: first,
      last_name: last,
      email,
      avatar: this.form.avatar.trim() || old.avatar,
      phone: phone || '',
      dob: dob || '',
      gender: gender || '',
    } as any;

    this.usersService.updateUser(updatedUser);
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
