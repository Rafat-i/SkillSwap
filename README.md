# SkillSwap — Freelance Marketplace
## By Rafat, Akeyla and Kevin

SkillSwap is a fully functional Angular application. It integrates with the official SkillSwap REST API to provide a complete freelance marketplace where clients post jobs, freelancers submit proposals, and both parties move through a structured workflow ending in mutual reviews and automatic rating updates.

---

## Table of Contents

- [Overview](#overview)
- [Business Flow](#business-flow)
- [Features](#features)
- [Project Structure](#project-structure)
- [Components](#components)
- [Services](#services)
- [Guards and Interceptors](#guards-and-interceptors)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Getting Started](#getting-started)

---

## Overview

The application is built entirely with Angular standalone components, uses Angular's functional route guards and HTTP interceptor for auth enforcement, and communicates with a hosted REST API. No data is hardcoded or mocked. All state comes from the API and all documented error responses are handled and surfaced to the user.

**API Base URL:** `https://stingray-app-wxhhn.ondigitalocean.app`

---

## Business Flow

The following end-to-end flow is fully supported by the application:

1. User A registers and logs in
2. User A posts a job
3. User B registers and logs in
4. User B browses jobs and submits a proposal
5. User A reviews the proposal and accepts it
6. The job moves automatically to `in_progress`
7. Either participant marks the job as completed
8. Both User A and User B leave a 1–5 star review for the other
9. Ratings are recalculated and reflected on each user's public profile

---

## Features

**For clients (job owners)**
- Post jobs with a title, category, budget, and description
- Edit any job field (title, category, budget, status, description) inline on the job detail page
- View all incoming proposals with freelancer price and cover letter
- Accept a proposal, which automatically rejects all others and sets the job to `in_progress`
- Mark a job as completed once work is delivered
- Leave a 1–5 star review for the freelancer after completion

**For freelancers**
- Browse all jobs with filters for category, minimum budget, and status
- Submit a proposal with a proposed price and cover letter
- View all submitted proposals in a personal dashboard with current status
- Withdraw any pending proposal from either the dashboard or the job detail page
- Leave a 1–5 star review for the client after completion

**General**
- JWT-based authentication with registration and login
- Automatic Bearer token injection on every outbound HTTP request via interceptor
- Automatic session clear and redirect to `/login` on any 401 response
- Public user profiles accessible at `/user/:username` showing bio, skills, rating average, completed job count, and review history
- Username conflict detection on registration with server-suggested alternative displayed inline
- Platform-wide statistics dashboard (total users, active jobs, total value moved)

---

## Project Structure

```
src/
  app/
    components/
      navbar/                  # Global navigation bar
      login/                   # Login page
      register/                # Registration page
      jobs/                    # Job listing and search
      job-details/             # Individual job view, proposals, reviews
      post-job/                # Job creation form
      my-bids/                 # Freelancer's submitted proposals
      my-postings/             # Client's posted jobs
      profile/                 # Authenticated user's own profile
      public-profile/          # Public profile view by username
      platform-stats/          # Aggregated platform statistics
    services/
      auth.service.ts          # Authentication, session management, user lookups
      job.service.ts           # Jobs, proposals, reviews, platform stats
      auth.interceptor.ts      # Attaches Bearer token; handles 401 globally
    guards/
      auth.guard.ts            # Blocks unauthenticated access to protected routes
      guest.guard.ts           # Redirects authenticated users away from auth pages
  styles.scss                  # Global styles
  main.ts                      # Application bootstrap
  index.html                   # HTML shell
```

---

## Components

### Navbar (`app-navbar`)

The global navigation bar rendered on all pages. Links include Browse Jobs, Post a Job, My Postings, My Proposals, and Platform Stats. When authenticated, shows a user pill with a profile link and a logout button. When unauthenticated, shows Login and Join links. Auth state is re-evaluated on every `NavigationEnd` event so the bar always reflects the live session state.

### Login (`app-login`)

Email and password login form. On success, stores the JWT token and user object via `AuthService` and redirects to the jobs listing. Displays server error messages inline.

### Register (`app-register`)

Registration form collecting full name, username, email, password, an optional bio, and a comma-separated skills list. Skills are parsed, trimmed, and sent as an array. If the server rejects the username as taken, the response's `suggested_username` field is displayed beneath the form so the user can try an alternative without leaving the page.

### Jobs (`app-jobs`)

The main job discovery page. Fetches and renders jobs from the API with filter controls for category (derived dynamically from live job data), minimum budget, and status. Each job card is a router link to its detail page. Defaults to showing open jobs on load.

### Job Details (`app-job-details`)

The most complex component. Rendering and available actions are conditional on the current user's relationship to the job:

- **Owner:** sees an inline edit form for all job fields, the full list of incoming proposals with freelancer ID, price, cover letter, and status, an accept button per pending proposal, a "Complete job" button once the job is `in_progress`, and a review form for the freelancer after the job is `completed`.
- **Hired freelancer:** sees the "Complete job" button while the job is `in_progress` and a review form for the client after completion.
- **Any other logged-in user:** sees a proposal submission form (price and cover letter), or a status card with the current proposal status and a withdraw option if they have already submitted.

The component checks for an existing review on load to prevent duplicate submission attempts, and handles the full accept, withdraw, complete, and review flows without requiring navigation away from the page.

### Post Job (`app-post-job`)

Form for creating a new job listing. Requires title, category, budget, and description. All fields are validated client-side before submission. On success, redirects to the jobs listing.

### My Proposals (`app-my-bids`)

Personal dashboard listing all proposals the logged-in user has submitted. Each card shows the associated job title, proposed price, cover letter, and current proposal status. Pending proposals can be withdrawn directly from this view. The withdraw action uses `event.stopPropagation()` to prevent the card's router link from triggering.

### My Postings (`app-my-postings`)

Personal dashboard listing all jobs the logged-in user has posted, showing category, budget, description, and current status. Each card links to the full job detail page.

### Profile (`app-profile`)

The authenticated user's own profile. Fetches the current user via `GET /users/me` then enriches the result with a full lookup by username to ensure rating and completed job data is present. Also loads the user's received reviews. Displays avatar initial, name, username, email, bio, skills as tags, rating average, completed job count, and all received reviews with reviewer name and star rating.

### Public Profile (`app-public-profile`)

Identical in layout to the private profile but resolved by username from the route parameter (`/user/:username`). Used when following client or freelancer links from a job detail page. Email is not shown. Loads the target user's profile and reviews in sequence.

### Platform Stats (`app-platform-stats`)

Dashboard showing three aggregated metrics from `GET /platform/stats`: total registered users, number of active jobs, and total monetary value moved through completed jobs. This endpoint is public and requires no authentication.

---

## Services

### AuthService

Handles all authentication and user lookup operations. The JWT token and user object are persisted to and read from `localStorage`.

| Method | Description |
|---|---|
| `register(name, username, email, password, bio, skills)` | POST `/auth/register` |
| `login(email, password)` | POST `/auth/login`, returns token and user object |
| `getMe()` | GET `/users/me` |
| `getUserByUsername(username)` | GET `/users/:username` |
| `getUserById(id)` | GET `/users/:id` |
| `setToken(token)` | Saves JWT to `localStorage` |
| `setUser(user)` | Saves user object to `localStorage` |
| `getToken()` | Reads stored JWT |
| `getStoredUser()` | Reads and parses stored user object |
| `clearSession()` | Removes token and user from `localStorage` |
| `getAuthHeaders()` | Returns `{ Authorization: 'Bearer <token>' }` |

### JobService

Handles all job, proposal, review, and platform stat API calls. The `getCategories()` method is derived client-side from a full job search rather than a dedicated endpoint.

| Method | Description |
|---|---|
| `searchJobs(filters)` | POST `/jobs/search` with optional category, status, min_budget |
| `getCategories()` | Calls `searchJobs`, extracts and sorts unique category values |
| `createJob(title, description, budget, category)` | POST `/jobs` |
| `getJobById(id)` | GET `/jobs/:id` |
| `updateJob(id, updates)` | PATCH `/jobs/:id` |
| `getMyPostings()` | GET `/jobs/my-postings` |
| `submitProposal(jobId, price, coverLetter)` | POST `/jobs/:jobId/proposals` |
| `getProposalsForJob(jobId)` | GET `/jobs/:jobId/proposals` |
| `acceptProposal(proposalId)` | PATCH `/proposals/:proposalId/accept` |
| `completeJob(jobId)` | PATCH `/jobs/:jobId/complete` |
| `getMyBids()` | GET `/proposals/my-bids` |
| `withdrawProposal(proposalId)` | DELETE `/proposals/:proposalId` |
| `submitReview(jobId, targetId, rating)` | POST `/jobs/:jobId/reviews` |
| `getUserReviews(userId)` | GET `/reviews/user/:userId` |
| `getPlatformStats()` | GET `/platform/stats` |

---

## Guards and Interceptors

### authGuard

A functional `CanActivateFn` applied to all protected routes. Reads the stored token via `AuthService` and redirects to `/login` if none is present.

### guestGuard

A functional `CanActivateFn` applied to `/login` and `/register`. If the user is already authenticated, redirects them to `/jobs` so they cannot access the auth pages while logged in.

### authInterceptor

A functional `HttpInterceptorFn` that clones every outbound HTTP request to add the `Authorization: Bearer <token>` header whenever a token exists in storage. It also catches all 401 responses, clears the session, and redirects to `/login`, handling token expiry and invalidation transparently for every component in the application.

---

## API Reference

**Base URL:** `https://stingray-app-wxhhn.ondigitalocean.app`

Protected endpoints require `Authorization: Bearer <token>` in the request header, which the interceptor attaches automatically. All error responses follow the format `{ "error": "message" }`.

**Common HTTP status codes:**

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |

### Auth Module

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create a new user. Required: name, username, email, password, bio, skills. Returns 409 with `suggested_username` if username is taken. |
| POST | `/auth/login` | No | Authenticate with email and password. Returns token and user object. |

### Users Module

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/users/me` | Yes | Returns the currently authenticated user's profile. |
| GET | `/users/:username` | No | Returns public profile: id, name, username, bio, skills, rating_avg, completed_jobs. |

### Jobs Module

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/jobs/search` | No | Search jobs. Optional body: category, status (default "open"), min_budget. |
| POST | `/jobs` | Yes | Create a job. Required: title, description, budget, category. |
| GET | `/jobs/:job_id` | Yes | Full job details including owner and freelancer summary. |
| PATCH | `/jobs/:job_id` | Yes (owner only) | Update title, description, budget, category, or status. Valid status values: open, in_progress, completed. |
| GET | `/jobs/my-postings` | Yes | Returns all jobs created by the authenticated user. |
| PATCH | `/jobs/:job_id/complete` | Yes | Mark job as completed. Caller must be owner or assigned freelancer. Job must be in_progress. |

### Proposals Module

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/jobs/:job_id/proposals` | Yes | Submit a proposal. Required: price, cover_letter or message. Cannot submit to own job. One pending proposal per job. |
| GET | `/jobs/:job_id/proposals` | Yes (owner only) | Returns all proposals for a job. |
| PATCH | `/proposals/:proposal_id/accept` | Yes | Accept a proposal. Rejects all others and sets job to in_progress. |
| GET | `/proposals/my-bids` | Yes | Returns all proposals submitted by the authenticated user. |
| DELETE | `/proposals/:proposal_id` | Yes | Withdraw a proposal. Only the proposal owner. Only pending proposals. |

### Reviews Module

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/jobs/:job_id/reviews` | Yes | Submit a review. Required: target_id, rating (integer 1–5). Job must be completed. One review per participant per job. |
| GET | `/reviews/user/:user_id` | No | Returns all reviews received by a user. |

### Platform Module

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/platform/stats` | No | Returns total_users, active_jobs, and total_value_moved. |

---

## Error Handling

All API error messages are caught and displayed inline within the relevant component. No errors are silently swallowed. Specific cases handled across the application include:

- Invalid credentials on login
- Missing required fields on all forms (client-side and server-side)
- Username or email conflict on registration, with the server-suggested username shown to the user
- Attempting to submit a proposal to your own job (403)
- Attempting to submit a duplicate proposal for the same job (409)
- Attempting to accept, complete, or review without the correct role or job status
- Any 401 response anywhere in the app triggers an automatic session clear and redirect to `/login`

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- Angular CLI 17 or later

### Installation

```bash
git clone https://github.com/Rafat-i/SkillSwap.git
cd skillswap
npm install
```

### Running locally

```bash
ng serve
```

Navigate to `http://localhost:4200`.