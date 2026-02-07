import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of } from 'rxjs';

type UiUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar: string;
};

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatIconModule],
  templateUrl: './users-table.html',
  styleUrl: './users-table.scss',
})
export class UsersTableComponent {
  displayedColumns: string[] = ['avatar', 'id', 'name', 'email', 'actions'];

  // TEMP data streams so template works (replace later with your service)
  users$: Observable<UiUser[]> = of([]);
  total$: Observable<number> = of(0);
  pageSizeView$: Observable<number> = of(15);
  pageIndexView$: Observable<number> = of(0);

  openAdd(): void {
    // TODO: open add dialog / navigate to add form
    console.log('openAdd()');
  }

  openUser(u: UiUser): void {
    // TODO: navigate to /users/:id
    console.log('openUser()', u);
  }

  openEdit(u: UiUser): void {
    // TODO: open edit dialog / navigate to edit form
    console.log('openEdit()', u);
  }

  remove(id: number): void {
    // TODO: call delete
    console.log('remove()', id);
  }

  onPageChange(e: PageEvent): void {
    // TODO: load users by page
    console.log('onPageChange()', e);
  }
}

