import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { ApiUser, UsersPageResponse } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private pageCache = new Map<number, Observable<UsersPageResponse>>();
  private userCache = new Map<number, Observable<ApiUser>>();

  constructor(private http: HttpClient) {}

  getUsersPage(page: number): Observable<UsersPageResponse> {
  if (!this.pageCache.has(page)) {
    const req$ = this.http
      .get<UsersPageResponse>('assets/mock-users.json')
      .pipe(shareReplay(1));

    this.pageCache.set(page, req$);
  }
  return this.pageCache.get(page)!;
}

getUserById(id: number): Observable<ApiUser> {
  if (!this.userCache.has(id)) {
    const req$ = this.http
      .get<UsersPageResponse>('assets/mock-users.json')
      .pipe(
        map(res => res.data.find(u => u.id === id)!),
        shareReplay(1)
      );
    this.userCache.set(id, req$);
  }
  return this.userCache.get(id)!;
}

}
