import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { JobService, Job } from '../../services/job.service';

@Component({
  selector: 'app-my-postings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-postings.component.html',
  styleUrl: './my-postings.component.scss'
})
export class MyPostingsComponent implements OnInit {
  jobs: Job[] = [];
  errorMessage = '';

  constructor(private readonly jobService: JobService) {}

  ngOnInit(): void {
    this.jobService.getMyPostings().subscribe({
      next: (data) => {
        this.jobs = data;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to load your jobs.';
      }
    });
  }
}
