import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private count = 0;
  readonly loading$ = new BehaviorSubject<boolean>(false);

  start() {
    this.count++;
    this.loading$.next(true);
  }

  stop() {
    this.count = Math.max(0, this.count - 1);
    this.loading$.next(this.count > 0);
  }
}
