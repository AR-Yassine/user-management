import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { ApiUser, UsersPageResponse } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private allUsers$?: Observable<ApiUser[]>;
  private userCache = new Map<number, Observable<ApiUser>>();

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<ApiUser[]> {
    if (!this.allUsers$) {
      this.allUsers$ = this.http
        .get<UsersPageResponse>('assets/mock-users.json')
        .pipe(map(res => res.data), shareReplay(1));
    }
    return this.allUsers$;
  }

  getUserById(id: number): Observable<ApiUser> {
    if (!this.userCache.has(id)) {
      const req$ = this.getAllUsers().pipe(
        map(all => all.find(u => u.id === id)!),
        shareReplay(1)
      );
      this.userCache.set(id, req$);
    }
    return this.userCache.get(id)!;
  }
}
