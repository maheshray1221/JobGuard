# JobGuard

JobGuard is an AI-assisted job-fraud screening API. Authenticated users can submit a pasted job description or public job-posting URL and receive a risk score, verdict, red flags, and positive trust signals. Results are saved to the user's history.

> JobGuard provides decision support only. It does not guarantee that a job listing, company, or recruiter is legitimate.

## Current Status

The TypeScript/Express backend is implemented. The Next.js frontend and production deployment are the next major milestones. See [PRD.md](./PRD.md) for the complete product scope.

## Technology

- Node.js, Express 5, and TypeScript
- MongoDB and Mongoose
- Zod request validation
- JWT authentication with HTTP-only cookies
- Groq (`llama-3.3-70b-versatile`) for analysis
- Axios and Cheerio for public page extraction
- Vitest and Supertest

## Local Setup

Requirements: Node.js 20+ and a MongoDB instance.

```bash
cd backend
npm ci
```

Copy `backend/.env.example` to `backend/.env`, then replace every placeholder:

```env
PORT=7000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
MONGO_URI=mongodb://127.0.0.1:27017/jobguard
ACCESS_TOKEN_SECRET=replace-with-a-long-random-secret
ACCESS_TOKEN_EXPIRY=30m
REFRESH_TOKEN_SECRET=replace-with-a-different-long-random-secret
REFRESH_TOKEN_EXPIRY=7d
GROQ_API_KEY=replace-with-your-groq-api-key
```

Never commit `.env` or place secrets directly in source files.

## Commands

Run these commands from `backend/`:

```bash
npm run dev       # Run the API from TypeScript
npm test          # Run the automated test suite once
npm run build     # Type-check and compile into dist/
npm start         # Run the compiled API
```

The default API address is `http://localhost:7000`.

Deployment platforms can check `GET /api/health` to verify that the API process is running.

## API

### Authentication

| Method | Route | Authentication | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create an account |
| POST | `/api/auth/login` | No | Sign in with username or email and set cookies |
| POST | `/api/auth/refresh-token` | Refresh cookie | Rotate session tokens |
| POST | `/api/auth/logout` | Access token | Clear tokens and end the session |
| GET | `/api/auth/me` | Access token | Return the current user |

Register:

```bash
curl -X POST http://localhost:7000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo_user","email":"demo@example.com","password":"secure123"}'
```

Login and store cookies:

```bash
curl -c cookies.txt -X POST http://localhost:7000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"secure123"}'
```

### Analysis

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/analysis/analyze` | Analyze pasted text or a public URL |
| GET | `/api/analysis/history` | List the user's saved analyses |
| GET | `/api/analysis/history/:id` | Get one owned analysis |

Analyze pasted text using the saved cookies:

```bash
curl -b cookies.txt -X POST http://localhost:7000/api/analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{"input":"Paste a complete job description of at least 30 characters here."}'
```

The analysis response contains:

```json
{
  "riskScore": 72,
  "verdict": "fake",
  "redFlags": ["Requests an upfront payment"],
  "greenFlags": []
}
```

Verdict bands are `safe` (0-30), `suspicious` (31-60), and `fake` (61-100).

## Security

- Authentication tokens are stored in HTTP-only cookies and rotated through the refresh endpoint.
- Login, registration, and analysis routes are rate-limited.
- URL analysis blocks loopback, private, link-local, and unsupported destinations, including unsafe redirects.
- History queries always include the authenticated user's ID.
- Production CORS must use the exact deployed frontend origin.
- Rotate any credential immediately if it is exposed.

## Project Structure

```text
backend/src/
├── controller/   # Request and response logic
├── middleware/   # Authentication, validation, and rate limits
├── model/        # Mongoose models
├── routes/       # Express route definitions
├── schemas/      # Zod request schemas
├── test/         # Shared test setup
├── types/        # Express type extensions
└── utils/        # AI, URL parsing, and response helpers
```

## Verification

Before opening a pull request:

```bash
npm test
npm run build
npm audit --omit=dev
```

Tests cover input detection and validation, protected routes, refresh-token rotation, rate limiting, URL security, AI analysis persistence, and history ownership.

## Deployment Notes

- Use MongoDB Atlas for production data.
- Deploy the backend to Render with all environment variables configured.
- Set `NODE_ENV=production` so cookies use secure cross-site settings.
- Set `CORS_ORIGIN` to the Vercel frontend URL without a trailing slash.
- Confirm cookies, refresh, analysis, history, and logout from the deployed frontend before release.

## Contributing

Follow [AGENTS.md](./AGENTS.md) for repository conventions. Keep commits focused, do not commit secrets, and include test/build results in pull requests.
