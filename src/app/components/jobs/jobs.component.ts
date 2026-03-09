import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { JobService, Job } from '../../services/job.service'; 


@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.scss'
})

export class JobsComponent implements OnInit {
  jobs: Job[] = [];

  constructor(private readonly jobService: JobService) {}


  ngOnInit(): void {
    this.jobService.searchJobs().subscribe({
      next: (data) => {
        this.jobs = data; 
      },
      error: (err) => {
        console.error('Failed to load jobs:', err);
      }
    });
  }
}