import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { JobService } from '../../services/job.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, StarRatingComponent],
  templateUrl: './public-profile.component.html',
  styleUrl: './public-profile.component.scss'
})
export class PublicProfileComponent implements OnInit {
  user: User | null = null;
  reviews: any[] = [];
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly jobService: JobService
  ) {}

  ngOnInit(): void {
    const username = this.route.snapshot.paramMap.get('username');
    if (username) {
      this.authService.getUserByUsername(username).subscribe({
        next: (data) => {
          this.user = data;
          
          this.jobService.getUserReviews(String(this.user.id)).subscribe({
            next: (reviewData) => {
              this.reviews = reviewData;
            },
            error: (err) => {
              console.error('Failed to load reviews:', err);
            }
          });
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Failed to load user profile.';
        }
      });
    }
  }
}