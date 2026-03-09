import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService, Proposal } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
  
  isEditing = false;
  editError = '';
  editData = {
    title: '',
    description: '',
    budget: 0,
    category: '',
    status: 'open'
  };

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

  getFreelancerUsername(p: any): string {
    return p.user?.username || p.username || '';
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.editError = '';
      this.editData = {
        title: this.job.title,
        description: this.job.description,
        budget: this.job.budget,
        category: this.job.category,
        status: this.job.status
      };
    }
  }

  saveEdit(): void {
    if (!this.editData.title || !this.editData.description || !this.editData.budget || !this.editData.category || !this.editData.status) {
      this.editError = 'All fields are required.';
      return;
    }
    this.editError = '';
    this.jobService.updateJob(this.jobId, this.editData).subscribe({
      next: () => {
        this.isEditing = false;
        this.successMessage = 'Job updated successfully.';
        this.jobService.getJobById(this.jobId).subscribe({
          next: (data) => {
            this.job = data;
            this.setReviewTarget();
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.editError = err.error?.error || 'Failed to update job.';
        this.cdr.detectChanges();
      }
    });
  }

  checkMyProposal(): void {
    this.jobService.getMyBids().subscribe({
      next: (bids) => {
        const myBid = bids.find((p) => String(p.job_id) === String(this.jobId));
        if (myBid) {
          this.hasSubmittedProposal = true;
          this.myProposalStatus = myBid.status;
          this.myProposalId = myBid.id;
          this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.withdrawError = err.error?.error || 'Failed to withdraw proposal.';
        this.cdr.detectChanges();
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
                this.freelancerNames[fid] = user.username || user.name || 'Freelancer';
                this.cdr.markForCheck();
              },
              error: () => {
                this.freelancerNames[fid] = 'Freelancer';
                this.cdr.markForCheck();
              }
            });
          }
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to load proposals.';
        this.cdr.detectChanges();
      }
    });
  }

  getProposalUserName(p: Proposal): string {
    if (p.user?.username) return p.user.username;
    if (p.user?.name) return p.user.name;
    if ((p as any).username) return (p as any).username;
    
    const fid = p.freelancer_id ?? (p as any).user_id;
    if (fid && this.freelancerNames[fid]) return this.freelancerNames[fid];
    return 'Freelancer';
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
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.acceptError = err.error?.error || 'Failed to accept proposal.';
        this.cdr.detectChanges();
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
    this.checkIfAlreadyReviewed();
  }

  checkIfAlreadyReviewed(): void {
    if (!this.reviewTargetId) return;
    this.jobService.getUserReviews(this.reviewTargetId).subscribe({
      next: (reviews) => {
        const alreadyReviewed = reviews.some((r: any) => 
          String(r.job_id) === String(this.jobId) || String(r.job?.id) === String(this.jobId)
        );
        if (alreadyReviewed) {
          this.hasReviewed = true;
          this.cdr.detectChanges();
        }
      }
    });
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 409) {
          this.hasReviewed = true;
          this.reviewError = 'You have already reviewed this user for this job.';
        } else {
          this.reviewError = err.error?.error || 'Failed to submit review.';
        }
        this.cdr.detectChanges();
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
            this.setReviewTarget();
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.completeError = err.error?.error || 'Failed to complete job.';
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/jobs']);
        }, 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to submit proposal.';
        this.successMessage = '';
        this.cdr.detectChanges();
      }
    });
  }
}