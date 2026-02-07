import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  shareReplay,
  tap,
} from 'rxjs';
import { ApiUser, UsersPageResponse } from '../models/user.models';

type UserResponse = { data: ApiUser };

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly API_BASE = 'http://localhost:3000/reqres/api';

  private readonly STORAGE_KEY = 'user_mgmt_users_v1';

  private usersSubject = new BehaviorSubject<ApiUser[]>([]);
  readonly users$ = this.usersSubject.asObservable();

  private loaded = false;

  private pageCache = new Map<number, Observable<UsersPageResponse>>();
  private userCache = new Map<number, Observable<ApiUser>>();
  private mockOnce$?: Observable<UsersPageResponse>;

  constructor(private http: HttpClient) {}

  private getMockOnce(): Observable<UsersPageResponse> {
    if (!this.mockOnce$) {
      this.mockOnce$ = this.http
        .get<UsersPageResponse>('assets/mock-users.json')
        .pipe(shareReplay(1));
    }
    return this.mockOnce$;
  }

  private loadFromStorage(): ApiUser[] | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ApiUser[];
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private saveToStorage(users: ApiUser[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    } catch {
    }
  }

  private ensureLocalUsersLoaded(): void {
    if (this.loaded) return;
    this.loaded = true;


    const fromLs = this.loadFromStorage();
    if (fromLs && fromLs.length) {
      this.usersSubject.next(fromLs);
      return;
    }


    this.getMockOnce()
      .pipe(
        map(r => r.data ?? []),
        tap(users => {
          this.usersSubject.next(users);
          this.saveToStorage(users);
        })
      )
      .subscribe();
  }


  getAllUsers(): Observable<ApiUser[]> {
    this.ensureLocalUsersLoaded();
    return this.users$;
  }

  getUserByIdLocal(id: number): Observable<ApiUser> {
    this.ensureLocalUsersLoaded();
    return this.users$.pipe(map(all => all.find(u => u.id === id)!));
  }

  addUser(user: ApiUser): void {
    this.ensureLocalUsersLoaded();
    const current = this.usersSubject.getValue();
    const next = [user, ...current];
    this.usersSubject.next(next);
    this.saveToStorage(next);

    this.pageCache.clear();
    this.userCache.delete(user.id);
  }

  updateUser(updated: ApiUser): void {
    this.ensureLocalUsersLoaded();
    const current = this.usersSubject.getValue();
    const next = current.map(u => (u.id === updated.id ? { ...u, ...updated } : u));
    this.usersSubject.next(next);
    this.saveToStorage(next);

    this.pageCache.clear();
    this.userCache.delete(updated.id);
  }

  deleteUser(id: number): void {
    this.ensureLocalUsersLoaded();
    const current = this.usersSubject.getValue();
    const next = current.filter(u => u.id !== id);
    this.usersSubject.next(next);
    this.saveToStorage(next);

    this.pageCache.clear();
    this.userCache.delete(id);
  }

  getUsersPage(page: number): Observable<UsersPageResponse> {
    if (this.pageCache.has(page)) return this.pageCache.get(page)!;

    const req$ = this.http
      .get<UsersPageResponse>(`${this.API_BASE}/users?page=${page}`)
      .pipe(
        tap(res => {
          const apiUsers = res.data ?? [];
          if (apiUsers.length) {
            this.ensureLocalUsersLoaded();
            const current = this.usersSubject.getValue();

            const mapById = new Map<number, ApiUser>();
            [...apiUsers, ...current].forEach(u => mapById.set(u.id, u));
            const merged = Array.from(mapById.values()).sort((a, b) => a.id - b.id);

            this.usersSubject.next(merged);
            this.saveToStorage(merged);
          }
        }),


        catchError(() => {
          this.ensureLocalUsersLoaded();
          return this.users$.pipe(map(all => this.sliceLocalAsPage(all, page)));
        }),

        shareReplay(1)
      );

    this.pageCache.set(page, req$);
    return req$;
  }

  getUsersForPage(page: number): Observable<ApiUser[]> {
    return this.getUsersPage(page).pipe(map(r => r.data ?? []));
  }

  getUserByIdApi(id: number): Observable<ApiUser> {
    if (this.userCache.has(id)) return this.userCache.get(id)!;

    const req$ = this.http
      .get<UserResponse>(`${this.API_BASE}/users/${id}`)
      .pipe(
        map(r => r.data),
        tap(u => {
          if (!u) return;
          this.ensureLocalUsersLoaded();
          const current = this.usersSubject.getValue();

          const exists = current.some(x => x.id === u.id);
          const next = exists
            ? current.map(x => (x.id === u.id ? { ...x, ...u } : x))
            : [u, ...current];

          this.usersSubject.next(next);
          this.saveToStorage(next);
        }),
        catchError(() => this.getUserByIdLocal(id)),
        shareReplay(1)
      );

    this.userCache.set(id, req$);
    return req$;
  }


  private sliceLocalAsPage(allUsers: ApiUser[], page: number): UsersPageResponse {
    const perPage = 6;
    const total = allUsers.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;

    return {
      page,
      per_page: perPage,
      total,
      total_pages: totalPages,
      data: allUsers.slice(start, start + perPage),
    };
  }
}
