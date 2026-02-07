import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UsersService } from '../../core/services/users.service';
import { ApiUser } from '../../core/models/user.models';
import { map, shareReplay } from 'rxjs';

type DashboardVM = {
  total: number;
  male: number;
  female: number;
  unknownGender: number;

  withPhone: number;
  withDob: number;

  avgAge: number | null;
  youngest: { name: string; age: number } | null;
  oldest: { name: string; age: number } | null;

  nextBirthdays: Array<{ name: string; date: string; inDays: number }>;

  genderPct: { male: number; female: number; unknown: number };
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private usersService = inject(UsersService);

  vm$ = this.usersService.getAllUsers().pipe(
    map(users => this.buildVM(users)),
    shareReplay(1)
  );

  private buildVM(users: ApiUser[]): DashboardVM {
    const total = users.length;

    const norm = (g?: string) => (g || '').trim().toLowerCase();
    const male = users.filter(u => norm(u.gender) === 'male').length;
    const female = users.filter(u => norm(u.gender) === 'female').length;
    const unknownGender = total - male - female;

    const withPhone = users.filter(u => !!u.phone?.trim()).length;
    const withDob = users.filter(u => !!u.dob?.trim()).length;

    const ages = users
      .map(u => ({ user: u, age: this.ageFromDob(u.dob) }))
      .filter(x => x.age !== null) as Array<{ user: ApiUser; age: number }>;

    const avgAge =
      ages.length > 0 ? Math.round((ages.reduce((s, x) => s + x.age, 0) / ages.length) * 10) / 10 : null;

    const youngest =
      ages.length > 0
        ? ages.reduce((a, b) => (a.age < b.age ? a : b))
        : null;

    const oldest =
      ages.length > 0
        ? ages.reduce((a, b) => (a.age > b.age ? a : b))
        : null;

    const nextBirthdays = this.getNextBirthdays(users).slice(0, 3);

    const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));
    const genderPct = { male: pct(male), female: pct(female), unknown: pct(unknownGender) };

    return {
      total,
      male,
      female,
      unknownGender,
      withPhone,
      withDob,
      avgAge,
      youngest: youngest ? { name: this.fullName(youngest.user), age: youngest.age } : null,
      oldest: oldest ? { name: this.fullName(oldest.user), age: oldest.age } : null,
      nextBirthdays,
      genderPct,
    };
  }

  private fullName(u: ApiUser): string {
    return `${u.first_name} ${u.last_name}`.trim();
  }

  private ageFromDob(dob?: string): number | null {
    if (!dob) return null;
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  }

  private getNextBirthdays(users: ApiUser[]) {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const items = users
      .filter(u => !!u.dob)
      .map(u => {
        const dob = new Date(u.dob!);
        if (Number.isNaN(dob.getTime())) return null;

        const next = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        if (next < startOfToday) next.setFullYear(today.getFullYear() + 1);

        const diffMs = next.getTime() - startOfToday.getTime();
        const inDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        const yyyy = next.getFullYear();
        const mm = String(next.getMonth() + 1).padStart(2, '0');
        const dd = String(next.getDate()).padStart(2, '0');

        return {
          name: this.fullName(u),
          date: `${yyyy}-${mm}-${dd}`,
          inDays,
        };
      })
      .filter(Boolean) as Array<{ name: string; date: string; inDays: number }>;

    return items.sort((a, b) => a.inDays - b.inDays);
  }

  phonePct(vm: { withPhone: number; total: number }): number {
  return vm.total ? Math.round((vm.withPhone / vm.total) * 100) : 0;
}

dobPct(vm: { withDob: number; total: number }): number {
  return vm.total ? Math.round((vm.withDob / vm.total) * 100) : 0;
}

}
