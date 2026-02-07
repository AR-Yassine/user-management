import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { UsersService } from '../../core/services/users.service';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { ApiUser } from '../../core/models/user.models';

type State =
  | { status: 'loading' }
  | { status: 'ready'; user: ApiUser }
  | { status: 'error' };

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './user-details.html',
  styleUrl: './user-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailsComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private usersService = inject(UsersService);

  state$ = this.route.paramMap.pipe(
    map(p => Number(p.get('id'))),
    switchMap(id =>
      this.usersService.getUserByIdApi(id).pipe(
        map(user => ({ status: 'ready', user } as State)),
        catchError(() => of({ status: 'error' } as State)),
        startWith({ status: 'loading' } as State)
      )
    )
  );

  back() {
    this.router.navigate(['/users/list']);
  }
}
