import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { ApiUser, UsersPageResponse } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private loaded = false;

  private usersSubject = new BehaviorSubject<ApiUser[]>([]);
  readonly users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<ApiUser[]> {
    if (!this.loaded) {
      this.loaded = true;
      this.http
        .get<UsersPageResponse>('assets/mock-users.json')
        .pipe(
          map(res => res.data ?? []),
          tap(users => this.usersSubject.next(users))
        )
        .subscribe();
    }
    return this.users$;
  }

  getUserById(id: number): Observable<ApiUser> {
    return this.getAllUsers().pipe(map(all => all.find(u => u.id === id)!));
  }


  addUser(user: ApiUser): void {
    const current = this.usersSubject.getValue();
    this.usersSubject.next([...current, user]);
  }

  updateUser(updated: ApiUser): void {
    const current = this.usersSubject.getValue();
    this.usersSubject.next(current.map(u => (u.id === updated.id ? { ...u, ...updated } : u)));
  }

  deleteUser(id: number): void {
    const current = this.usersSubject.getValue();
    this.usersSubject.next(current.filter(u => u.id !== id));
  }
}
