import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-post-job',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-job.component.html',
  styleUrl: './post-job.component.scss'
})
export class PostJobComponent {
  title = '';
  category = '';
  budget: number | null = null;
  description = '';
  
  errorMessage = '';

  constructor(private readonly jobService: JobService, private readonly router: Router) {}

  onSubmit() {
    if (!this.title || !this.description || !this.budget || !this.category) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    this.jobService.createJob(this.title, this.description, this.budget, this.category).subscribe({
      next: () => {
        this.router.navigate(['/jobs']);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to post job.';
      }
    });
  }
}