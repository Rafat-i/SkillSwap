import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  name = '';
  username = '';
  email = '';
  password = '';
  bio = '';
  skillsInput = '';
  errorMessage = '';
  suggestedUsername = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  submit() {
    this.errorMessage = '';
    this.suggestedUsername = '';
    const skills = this.skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    this.authService.register(this.name, this.username, this.email, this.password, this.bio, skills).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Registration failed';
        if (err.error?.suggested_username) {
          this.suggestedUsername = err.error.suggested_username;
        }
      }
    });
  }
}