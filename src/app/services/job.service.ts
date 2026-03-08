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
}