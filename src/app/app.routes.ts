import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { JobsComponent } from './components/jobs/jobs.component';
import { MyPostingsComponent } from './components/my-postings/my-postings.component';
import { PostJobComponent } from './components/post-job/post-job.component';
import { JobDetailsComponent } from './components/job-details/job-details.component';
import { MyBidsComponent } from './components/my-bids/my-bids.component';
import { ProfileComponent } from './components/profile/profile.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'jobs', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'jobs', component: JobsComponent, canActivate: [authGuard] },
  { path: 'jobs/my-postings', component: MyPostingsComponent, canActivate: [authGuard] },
  { path: 'jobs/:id', component: JobDetailsComponent, canActivate: [authGuard] },
  { path: 'post-job', component: PostJobComponent, canActivate: [authGuard] },
  { path: 'my-bids', component: MyBidsComponent, canActivate: [authGuard] },
  { path: 'profile/me', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
