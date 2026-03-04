import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  bio: string;
  skills: string[];
  rating_avg: number;
  completed_jobs: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly BASE_URL = 'https://stingray-app-wxhhn.ondigitalocean.app';

  constructor(private readonly http: HttpClient) {}

  register(name: string, username: string, email: string, password: string, bio: string, skills: string[]): Observable<any> {
    return this.http.post(`${this.BASE_URL}/auth/register`, { name, username, email, password, bio, skills });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.BASE_URL}/auth/login`, { email, password });
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.BASE_URL}/users/me`, { headers: new HttpHeaders(this.getAuthHeaders()) });
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getStoredUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getAuthHeaders() {
    return { Authorization: `Bearer ${this.getToken()}` };
  }

}