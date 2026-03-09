import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  freelancerNames: Record<string, string> = {};
  isOwner = false;
  isFreelancer = false;
  acceptError = '';
  completeError = '';
  reviewError = '';
  reviewRating = 3;
  hasReviewed = false;
  reviewTargetId = '';
  reviewTargetName = '';
  hasSubmittedProposal = false;
  myProposalStatus = '';
  myProposalId = '';
  withdrawError = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly jobService: JobService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id') || '';
    if (this.jobId) {
      this.jobService.getJobById(this.jobId).subscribe({
        next: (data) => {
          this.job = data;
          const me = this.authService.getStoredUser();
          const ownerId = this.job.owner?.id ?? this.job.owner_id;
          const freelancerId = this.job.freelancer?.id ?? this.job.freelancer_id;
          this.isOwner = !!me && ownerId != null && String(ownerId) === String(me.id);
          this.isFreelancer = !!me && freelancerId != null && String(freelancerId) === String(me.id);
          if (this.isOwner && this.job.status === 'open') {
            this.loadProposals();
          }
          if (this.job.status === 'open' && !this.isOwner) {
            this.checkMyProposal();
          }
          if (this.job.status === 'completed' && (this.isOwner || this.isFreelancer)) {
            this.setReviewTarget();
          }
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Failed to load job details.';
        }
      });
    }
  }

  checkMyProposal(): void {
    this.jobService.getMyBids().subscribe({
      next: (bids) => {
        const myBid = bids.find((p) => String(p.job_id) === String(this.jobId));
        if (myBid) {
          this.hasSubmittedProposal = true;
          this.myProposalStatus = myBid.status;
          this.myProposalId = myBid.id;
        }
      }
    });
  }

  withdrawProposal(): void {
    if (!this.myProposalId) return;
    this.withdrawError = '';
    this.jobService.withdrawProposal(this.myProposalId).subscribe({
      next: () => {
        this.hasSubmittedProposal = false;
        this.myProposalStatus = '';
        this.myProposalId = '';
        this.successMessage = 'Proposal withdrawn successfully.';
      },
      error: (err) => {
        this.withdrawError = err.error?.error || 'Failed to withdraw proposal.';
      }
    });
  }

  loadProposals(): void {
    this.jobService.getProposalsForJob(this.jobId).subscribe({
      next: (data) => {
        this.proposals = data;
        this.freelancerNames = {};
        data.forEach((p) => {
          const fid = p.freelancer_id ?? (p as any).user_id;
          if (fid) {
            this.authService.getUserById(fid).subscribe({
              next: (user) => {
                this.freelancerNames = { ...this.freelancerNames, [fid]: user.username || user.name || 'Freelancer' };
                this.cdr.markForCheck();
              },
              error: () => {
                this.freelancerNames = { ...this.freelancerNames, [fid]: 'Freelancer' };
                this.cdr.markForCheck();
              }
            });
          }
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to load proposals.';
      }
    });
  }

  getProposalUserName(p: Proposal): string {
    if (p.user?.username) return p.user.username;
    if (p.user?.name) return p.user.name;
    if ((p as any).username) return (p as any).username;
    const fid = p.freelancer_id ?? (p as any).user_id;
    if (fid && this.freelancerNames[fid]) return this.freelancerNames[fid];
    if (fid) return 'Freelancer';
    return 'Unknown user';
  }

  acceptProposal(proposalId: string): void {
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

  setReviewTarget(): void {
    if (this.isOwner) {
      this.reviewTargetId = this.job.freelancer?.id ?? this.job.freelancer_id ?? '';
      this.reviewTargetName = this.job.freelancer?.username ?? this.job.freelancer?.name ?? 'the freelancer';
    } else {
      this.reviewTargetId = this.job.owner?.id ?? this.job.owner_id ?? '';
      this.reviewTargetName = this.job.owner?.username ?? this.job.owner?.name ?? 'the client';
    }
  }

  submitReview(): void {
    if (!this.reviewTargetId || this.reviewRating < 1 || this.reviewRating > 5) {
      this.reviewError = 'Please select a rating between 1 and 5.';
      return;
    }
    this.reviewError = '';
    this.jobService.submitReview(this.jobId, this.reviewTargetId, Math.round(this.reviewRating)).subscribe({
      next: () => {
        this.hasReviewed = true;
        this.successMessage = 'Review submitted successfully.';
      },
      error: (err) => {
        this.reviewError = err.error?.error || 'Failed to submit review.';
      }
    });
  }

  completeJob(): void {
    this.completeError = '';
    this.jobService.completeJob(this.jobId).subscribe({
      next: () => {
        this.successMessage = 'Job marked as completed.';
        this.jobService.getJobById(this.jobId).subscribe({
          next: (data) => {
            this.job = data;
          }
        });
      },
      error: (err) => {
        this.completeError = err.error?.error || 'Failed to complete job.';
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
        this.hasSubmittedProposal = true;
        this.myProposalStatus = 'pending';
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
