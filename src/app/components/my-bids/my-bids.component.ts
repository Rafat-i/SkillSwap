import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { JobService, Proposal } from '../../services/job.service';

@Component({
  selector: 'app-my-bids',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-bids.component.html',
  styleUrl: './my-bids.component.scss'
})
export class MyBidsComponent implements OnInit {
  proposals: Proposal[] = [];
  errorMessage = '';

  constructor(private readonly jobService: JobService) {}

  ngOnInit(): void {
    this.loadBids();
  }

  loadBids(): void {
    this.jobService.getMyBids().subscribe({
      next: (data) => {
        this.proposals = data;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to load your bids.';
      }
    });
  }

  withdrawProposal(proposalId: string, event: Event): void {
    event.stopPropagation();
    if (!confirm('Withdraw this proposal?')) return;
    this.jobService.withdrawProposal(proposalId).subscribe({
      next: () => {
        this.proposals = this.proposals.filter((p) => p.id !== proposalId);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to withdraw proposal.';
      }
    });
  }
}
