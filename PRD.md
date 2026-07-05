# JobGuard Product Requirements Document

## 1. Product Summary

JobGuard is a web application that helps job seekers assess potentially fraudulent job listings. An authenticated user can paste a job description or submit a public job-posting URL. The system extracts relevant text, evaluates scam indicators with AI, and returns a risk score, verdict, red flags, and positive trust signals.

This document defines the MVP and uses `JobGuard_Status.pdf` as the authoritative progress tracker.

## 2. Problem Statement

Fraudulent listings commonly use unrealistic compensation, vague responsibilities, urgency, personal email addresses, or requests for money and sensitive documents. Job seekers need a quick, understandable screening tool before engaging with a recruiter.

JobGuard provides decision support. It does not guarantee that a listing or recruiter is legitimate or fraudulent.

## 3. Target Users and Goals

### Target users

- Students and early-career applicants.
- Active job seekers reviewing listings from job boards, email, or messaging apps.
- Freelancers and remote workers evaluating unfamiliar companies.

### MVP goals

- Analyze pasted text or a public URL in under one minute.
- Explain each verdict with specific red and green flags.
- Save and display analyses belonging to the authenticated user.
- Handle invalid input and external-service failures with useful guidance.
- Deliver a secure, responsive experience from registration through history.

Formal product metrics and advanced observability are useful after deployment but are not release blockers.

## 4. Project Status

Status values reflect `JobGuard_Status.pdf`, not repository verification.

| Area | Requirement | Status | Notes |
|---|---|---|---|
| Backend | User and analysis models | Completed | Mongoose models with timestamps and stored analysis results |
| Backend | Register and login | Completed | Password hashing, JWTs, and HTTP-only cookies |
| Backend | Logout and current-user (`getMe`) | Completed | Cookie clearing and authenticated user response |
| Backend | JWT protection middleware | Completed | Rejects missing or invalid credentials |
| Backend | Zod body validation | Completed | Field-level request validation |
| Backend | Async and API response utilities | Completed | Shared controller and response helpers |
| Backend | Text/URL input detection | Completed | Supports `http`, `https`, `www`, and pasted text |
| Backend | URL fetch and parsing | Completed | Axios, Cheerio, timeout handling, and 4,000-character cap |
| Backend | Groq fraud analysis | Completed | Llama 3.3 70B, structured response parsing, and validation |
| Backend | Analysis controller and MongoDB save | Completed | Postman and database verification reported |
| Backend | History list | Completed | `GET /api/analysis/history`, newest first and scoped to the user |
| Backend | History detail | Completed | `GET /api/analysis/history/:id`, scoped to the user |
| Backend | Rate limiting | Completed | Applied to analysis, login, and registration routes |
| Frontend | Next.js 15 application | Pending | TypeScript and Tailwind CSS |
| Frontend | Authentication pages | Pending | Login and registration forms |
| Frontend | Analysis and result experience | Pending | Input, loading state, score, verdict, and flags |
| Frontend | History experience | Pending | Past analyses with date, score, verdict, and input type |
| Frontend | Navigation, errors, responsiveness | Pending | Navbar, logout, messages, and mobile layouts |
| Deployment | MongoDB Atlas | Completed | Cloud database reported as connected |
| Deployment | Render backend | Pending | Deploy after API readiness |
| Deployment | Vercel frontend | Pending | Deploy after frontend readiness |
| Documentation | README | Pending | Setup, environment variables, screenshots, and live links |

### Repository verification note

The PDF remains the baseline project tracker. The local repository now verifies logout, `getMe`, analysis validation, the intended endpoint paths, environment-based Groq configuration, user-scoped history routes, rate limiting, and private-network URL blocking. Runtime behavior still requires integration tests with MongoDB and Groq credentials.

## 5. Core User Journey

1. A user creates an account and signs in.
2. The user pastes a job description or public URL.
3. JobGuard validates the input and extracts page text when required.
4. The AI returns a score from 0 to 100, a verdict, red flags, and green flags.
5. The UI presents the result, safety guidance, and a clear disclaimer.
6. JobGuard saves the analysis to the user's history.
7. The user can review a history list and open an individual result.
8. The user signs out securely.

## 6. Functional Requirements

### FR-1: Accounts and authentication

- Register a unique name/username and email with a securely hashed password.
- Login and issue access credentials through secure, HTTP-only cookies.
- Support logout and a current-user endpoint.
- Protect analysis and history endpoints with JWT middleware.
- Return consistent errors for invalid credentials, duplicate accounts, and expired sessions.
- A user `role` is not required unless administrator functionality is introduced later.

### FR-2: Job input and URL extraction

- Accept pasted text or an HTTP/HTTPS URL through one input.
- Apply the Zod analysis schema before calling the controller.
- Reject empty or insufficient descriptions and cap accepted content.
- Normalize URLs beginning with `www.`.
- Fetch public pages with a 10-second timeout and remove irrelevant markup.
- Give actionable errors when pages block scraping, time out, or contain insufficient text.
- Prevent server-side request forgery by blocking private, loopback, link-local, and non-HTTP destinations.

### FR-3: Fraud analysis and results

- Return `riskScore` from 0 to 100, `verdict`, `redFlags`, and `greenFlags`.
- Use verdict bands of 0-30 `safe`, 31-60 `suspicious`, and 61-100 `fake`.
- Validate and clamp the AI response before saving or returning it.
- Display the score and verdict prominently without relying only on color.
- Show practical advice, including independently verifying the employer, avoiding payments, and withholding sensitive documents.
- Explain that the result is guidance, not identity, legal, or financial verification.

### FR-4: User history

- Save the original input, input type, extracted text, source URL, result, user ID, and timestamps.
- List the authenticated user's analyses in newest-first order.
- Display date, score, verdict, and input-type badge in the history list.
- Allow the user to open a full saved result.
- Enforce ownership in every history query; users must never access another user's records.
- Deleting history is deferred until after MVP.

### FR-5: Lean frontend

- Use Next.js 15, TypeScript, and Tailwind CSS.
- Provide login and registration forms with client-side validation and API errors.
- Provide a single analysis input with an auto-detection hint and Analyze button.
- Display loading feedback during analysis and skeleton feedback during history loading.
- Present results in a card with a score, verdict badge, and red/green flag lists.
- Provide history, navigation, logout, inline/toast errors, and responsive `sm`/`md`/`lg` layouts.
- shadcn/ui is optional and should be used only when it accelerates consistent accessible components.

## 7. API Contract

All protected routes use the authenticated user derived from the JWT cookie.

| Method | Endpoint | Purpose | Status |
|---|---|---|---|
| POST | `/api/auth/register` | Create an account | Completed |
| POST | `/api/auth/login` | Start an authenticated session | Completed |
| POST | `/api/auth/logout` | Clear the authenticated session | Completed |
| GET | `/api/auth/me` | Return the current user | Completed |
| POST | `/api/analysis/analyze` | Analyze pasted text or a URL | Completed |
| GET | `/api/analysis/history` | List the user's analyses | Completed |
| GET | `/api/analysis/history/:id` | Return one owned analysis | Completed |

The implementation must be changed to match these paths, or all clients and documentation must be changed together before release. No mixed route scheme is permitted.

## 8. Security, Reliability, and Quality

- Read `GROQ_API_KEY`, database credentials, and JWT secrets from environment variables.
- Revoke the previously exposed Groq key and place only its replacement in `GROQ_API_KEY`.
- Configure production CORS for the deployed frontend origin and credentialed requests.
- Rate-limit login, registration, and analysis; analysis should use the strictest limit.
- Do not log passwords, tokens, secrets, or full submitted descriptions.
- Return consistent JSON errors for validation, authentication, database, parsing, network, and AI failures.
- Keep frontend controls keyboard-accessible with labels, visible focus, and non-color status cues.
- Add request IDs, latency, endpoint, and error-category logging after the MVP is stable.

## 9. Testing Requirements

Automated tests must cover:

- Registration, login, logout, `getMe`, invalid credentials, and expired sessions.
- Analysis-schema rejection before any external AI call.
- Successful pasted-text and URL analyses.
- Blocked, invalid, private-network, timed-out, and content-poor URLs.
- Empty, malformed, or out-of-range AI responses.
- History ordering, missing records, invalid IDs, and cross-user access denial.
- Authentication and analysis rate limits.
- Frontend loading, errors, result rendering, protected navigation, and responsive layouts.

The backend must pass `npm run build`, and the deployed frontend must complete the full journey against the deployed API.

## 10. Deployment and Documentation

- Use MongoDB Atlas for production data.
- Deploy the Express API to Render with production secrets and CORS configuration.
- Deploy the Next.js frontend to Vercel with the backend base URL configured by environment.
- Verify registration, authentication cookies, analysis, history, and logout in production.
- Add a README containing setup commands, required environment-variable names, architecture, API paths, screenshots, and live links.

## 11. Priority and Scope Decisions

### Essential for MVP

Authentication, protected analysis, validation, explainable AI results, history list/detail, secure configuration, rate limiting, tests, responsive UI, failure states, deployment, and README documentation.

### Useful but optional

shadcn/ui and basic production metrics. They should not delay the working end-to-end flow.

### Deferred

History deletion, role-based access, administrator dashboards, bulk analysis, browser extensions, mobile apps, subscriptions, and custom model training.

## 12. MVP Acceptance Criteria

- Users can register, sign in, retrieve their session, and sign out securely.
- Authenticated users can analyze both pasted descriptions and supported URLs.
- Every successful analysis contains a valid score, verdict, and explanation lists.
- Failed input, extraction, AI, and authentication requests return actionable errors.
- Users can list and open only their own saved analyses.
- Analysis and authentication routes enforce suitable rate limits.
- No credentials are committed or hard-coded.
- The responsive frontend works end-to-end with the deployed backend.
- Required automated tests pass, and setup/deployment instructions are documented.
