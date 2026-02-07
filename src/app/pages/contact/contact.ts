import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  name = '';
  email = '';
  subject = '';
  message = '';

  submit(): void {

    console.log({
      name: this.name,
      email: this.email,
      subject: this.subject,
      message: this.message,
    });
    this.name = '';
    this.email = '';
    this.subject = '';
    this.message = '';
  }
}
