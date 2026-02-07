import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

type Review = {
  name: string;
  role: string;
  stars: number;
  comment: string;
  date: string;
};

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewsComponent {
  reviews: Review[] = [
    {
      name: 'George Bluth',
      role: 'Admin',
      stars: 5,
      comment: 'Very clean UI, fast navigation, and easy user management.',
      date: '2026-02-01',
    },
    {
      name: 'Janet Weaver',
      role: 'HR',
      stars: 4,
      comment: 'Great structure and layout. The table view is super helpful.',
      date: '2026-02-02',
    },
  ];


  name = '';
  role = '';
  message = '';
  rating = 0;

  setRating(n: number): void {
    this.rating = n;
  }

  submitReview(): void {
    if (!this.name || !this.message || this.rating === 0) return;

    this.reviews.unshift({
      name: this.name,
      role: this.role || 'User',
      stars: this.rating,
      comment: this.message,
      date: new Date().toISOString().split('T')[0],
    });


    this.name = '';
    this.role = '';
    this.message = '';
    this.rating = 0;
  }

  starsArray(n: number): number[] {
    return Array.from({ length: n });
  }

  emptyStarsArray(n: number): number[] {
    return Array.from({ length: 5 - n });
  }

  trackByName(_: number, r: { name: string }): string {
  return r.name;
}

}
