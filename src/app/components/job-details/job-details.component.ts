import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService, Proposal } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';

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
  proposals: Proposal[] = [];
  isOwner = false;
  acceptError = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly jobService: JobService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id') || '';
    if (this.jobId) {
      this.jobService.getJobById(this.jobId).subscribe({
        next: (data) => {
          this.job = data;
          const me = this.authService.getStoredUser();
          const ownerId = this.job.owner?.id ?? this.job.owner_id;
          this.isOwner = !!me && ownerId != null && ownerId === me.id;
          if (this.isOwner && this.job.status === 'open') {
            this.loadProposals();
          }
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Failed to load job details.';
        }
      });
    }
  }

  loadProposals(): void {
    this.jobService.getProposalsForJob(this.jobId).subscribe({
      next: (data) => {
        this.proposals = data;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to load proposals.';
      }
    });
  }

  acceptProposal(proposalId: number): void {
    this.acceptError = '';
    this.jobService.acceptProposal(proposalId).subscribe({
      next: () => {
        this.successMessage = 'Proposal accepted. Job is now in progress.';
        this.jobService.getJobById(this.jobId).subscribe({
          next: (data) => {
            this.job = data;
            this.proposals = [];
          }
        });
      },
      error: (err) => {
        this.acceptError = err.error?.error || 'Failed to accept proposal.';
      }
    });
  }

  submitProposal(): void {
    if (!this.price || !this.coverLetter) {
      this.errorMessage = 'Price and cover letter are required.';
      return;
    }

    this.errorMessage = '';
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
