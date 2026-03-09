import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService, Job } from '../../services/job.service'; 

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.scss'
})
export class JobsComponent implements OnInit {
  jobs: Job[] = [];
  errorMessage = '';

  filters = {
    category: '',
    min_budget: null as number | null,
    status: 'open'
  };

  constructor(private readonly jobService: JobService) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    const payload: any = {};
    if (this.filters.category) payload.category = this.filters.category;
    if (this.filters.status) payload.status = this.filters.status;
    if (this.filters.min_budget !== null && this.filters.min_budget !== undefined) {
      payload.min_budget = Number(this.filters.min_budget);
    }

    this.jobService.searchJobs(payload).subscribe({
      next: (data) => {
        this.jobs = data;
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to load jobs.';
        console.error('Failed to load jobs:', err);
      }
    });
  }

  applyFilters(): void {
    this.loadJobs();
  }
}