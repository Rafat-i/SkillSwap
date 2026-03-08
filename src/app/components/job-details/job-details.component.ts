import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss'
})
export class JobDetailsComponent implements OnInit {
  job: any;
  jobId: string = '';
  price: number | null = null;
  coverLetter: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly jobService: JobService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id') || '';
    if (this.jobId) {
      this.jobService.getJobById(this.jobId).subscribe({
        next: (data) => {
          this.job = data;
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Failed to load job details.';
        }
      });
    }
  }

  submitProposal(): void {
    if (!this.price || !this.coverLetter) {
      this.errorMessage = 'Price and cover letter are required.';
      return;
    }

    this.jobService.submitProposal(this.jobId, this.price, this.coverLetter).subscribe({
      next: () => {
        this.successMessage = 'Proposal submitted successfully!';
        this.errorMessage = '';
        setTimeout(() => {
          this.router.navigate(['/jobs']);
        }, 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to submit proposal.';
        this.successMessage = '';
      }
    });
  }
}