import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  errorMessage = '';

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to load profile.';
      }
    });
  }
}
