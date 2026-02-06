import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, map, shareReplay, switchMap, startWith } from 'rxjs';
import { UsersService } from '../../core/services/users.service';
import { ApiUser } from '../../core/models/user.models';

type ViewState =
  | { status: 'loading' }
  | { status: 'ready'; user: ApiUser }
  | { status: 'notfound' };

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './user-details.html',
  styleUrl: './user-details.scss',
})
export class UserDetailsComponent {
  readonly state$: Observable<ViewState>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService
  ) {
    this.state$ = this.route.paramMap.pipe(
      map((p) => Number(p.get('id'))),
      switchMap((id) =>
        this.usersService.getUserById(id).pipe(
          map((user) => ({ status: 'ready', user } as ViewState)),
          startWith({ status: 'loading' } as ViewState)
        )
      ),
      shareReplay(1)
    );
  }

  back() {
    this.router.navigate(['/users']);
  }
}
