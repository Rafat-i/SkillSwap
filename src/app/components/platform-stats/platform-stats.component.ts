import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-platform-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './platform-stats.component.html',
  styleUrl: './platform-stats.component.scss'
})
export class PlatformStatsComponent implements OnInit {
  stats: any = null;
  errorMessage = '';

  constructor(private readonly jobService: JobService) {}

  ngOnInit(): void {
    this.jobService.getPlatformStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to load platform statistics.';
      }
    });
  }
}