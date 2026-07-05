# Repository Guidelines

## Project Structure & Module Organization

JobGuard currently contains a Node.js/TypeScript API in `backend/`. Application code lives in `backend/src/`: `controller/` handles HTTP logic, `routes/` defines Express endpoints, `model/` contains Mongoose models, `schemas/` holds Zod validation, and `middleware/` provides authentication and request validation. Database setup is in `db/`, shared helpers are in `utils/`, and Express type extensions belong in `types/`. `app.ts` configures the server; `index.ts` loads configuration, connects MongoDB, and starts it. Compiled output goes to `backend/dist/` and must not be committed.

## Build, Test, and Development Commands

Run commands from `backend/`:

- `npm ci` installs the exact dependency versions from `package-lock.json`.
- `npm run dev` runs the API directly from TypeScript with `tsx`.
- `npm run build` performs strict TypeScript checks and emits JavaScript to `dist/`.
- `npm start` runs the compiled `dist/index.js`; build first.

No automated test command is configured yet. At minimum, run `npm run build` before submitting changes.

## Coding Style & Naming Conventions

Use two-space indentation, double quotes, semicolons, and trailing commas where supported. This project uses ESM with NodeNext resolution: local TypeScript imports must retain `.js` extensions. Name files by responsibility, such as `auth.route.ts`, `user.controller.ts`, and `validate.middleware.ts`. Use `camelCase` for functions and variables, `PascalCase` for interfaces/classes, and uppercase snake case for environment variables. Keep controllers thin and move reusable parsing or external-service logic into `utils/`.

## Testing Guidelines

When adding tests, introduce a documented test runner and an `npm test` script. Place tests beside their modules as `*.test.ts` or under `backend/src/__tests__/`. Cover successful requests, validation failures, authentication failures, and database/service errors. Mock MongoDB and external AI/network calls so tests remain deterministic.

## Commit & Pull Request Guidelines

Existing history uses short, imperative, lowercase summaries (for example, `add utils functions`). Keep commits focused and use a clear form such as `add analysis validation` or `fix refresh token expiry`. Pull requests should explain behavior changes, list verification commands, link relevant issues, and include sample requests/responses for API changes.

## Security & Configuration

Keep `.env`, credentials, JWT secrets, database URIs, and API keys out of Git. Read all secrets through `process.env`, document new variable names, and rotate any credential that is accidentally exposed. Typical local variables include `PORT`, `MONGO_URI`, `ACCESS_TOKEN_SECRET`, and refresh/access token expiry settings.
