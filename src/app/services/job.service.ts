import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Job {
  id?: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  status: string;
  owner?: { id: number; username?: string };
}

export interface Proposal {
  id: number;
  job_id: number;
  user_id: number;
  price: number;
  cover_letter?: string;
  message?: string;
  status: string;
  user?: { id: number; username: string; name?: string };
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private readonly BASE_URL = 'https://stingray-app-wxhhn.ondigitalocean.app';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  searchJobs(filters: any = {}): Observable<Job[]> {
    return this.http.post<Job[]>(`${this.BASE_URL}/jobs/search`, filters);
  }

  createJob(title: string, description: string, budget: number, category: string): Observable<Job> {
    return this.http.post<Job>(`${this.BASE_URL}/jobs`, { title, description, budget, category });
  }

  getJobById(id: string): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/jobs/${id}`);
  }

  submitProposal(jobId: string, price: number, coverLetter: string): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/jobs/${jobId}/proposals`, { price, cover_letter: coverLetter });
  }

  getMyPostings(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.BASE_URL}/jobs/my-postings`);
  }

  getProposalsForJob(jobId: string): Observable<Proposal[]> {
    return this.http.get<Proposal[]>(`${this.BASE_URL}/jobs/${jobId}/proposals`);
  }

  acceptProposal(proposalId: number): Observable<any> {
    return this.http.patch<any>(`${this.BASE_URL}/proposals/${proposalId}/accept`, {});
  }
}