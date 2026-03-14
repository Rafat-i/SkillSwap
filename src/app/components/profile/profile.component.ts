import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { JobService } from '../../services/job.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, StarRatingComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  reviews: any[] = [];
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly jobService: JobService
  ) {}

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (meData) => {

        this.authService.getUserByUsername(meData.username).subscribe({
          next: (fullData) => {
            this.user = fullData;
            this.authService.setUser(fullData);
          },
          error: () => {
            this.user = meData;
          }
        });

        this.jobService.getUserReviews(String(meData.id)).subscribe({
          next: (reviewData) => {
            this.reviews = reviewData;
          },
          error: (err) => {
            console.error('Failed to load your reviews:', err);
          }
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to load profile.';
      }
    });
  }
}