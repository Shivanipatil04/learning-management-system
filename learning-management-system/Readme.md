# LearnHub

Multi-tenant, contract-based online learning platform. Coaching Classes operate as tenant admins, contract teachers on a time-bound basis, and students purchase courses across the entire platform catalog.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React (Vite)
- **Live sessions:** LiveKit
- **Payments:** Razorpay

## Folder Structure

```
learning-management-system/
├── backend/     # Express API — organized by feature module (see backend/src/modules)
└── frontend/    # React app (Vite) — organized by feature (see frontend/src/features)
```

Backend and frontend are organized by **feature**, not by file type — e.g. everything related to Courses (model, controller, routes, service) lives together in `modules/courses/` (backend) and `features/courses/` (frontend).

## Prerequisites

- Node.js `v20.x` (check with `node -v`)
- npm
- A MongoDB connection string (local MongoDB or MongoDB Atlas)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Shivanipatil04/learning-management-system.git
cd learning-management-system/learning-management-system
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env` with real values:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_own_random_secret_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Run the backend:
```bash
npm run dev
```

You should see:
```
MongoDB connected
Server running on port 5000
```

Confirm it's working: open `http://localhost:5000/api/health` — should return `{ "status": "ok" }`.

### 3. Frontend setup

In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` by default.

## Git Workflow

- `main` — stable branch.
- Personal/feature branches — branch off `main` (e.g. `yourname-dev` or `feature/auth-module`).
- Open a Pull Request into `main` when a feature is ready, rather than merging directly, once more than one person is working on the repo.
- Keep your branch in sync with `main` periodically:
  ```bash
  git checkout your-branch
  git merge main
  ```

## Core Concepts (read before contributing)

- **Permission-based access, not role-based** — users hold a `permissions` array (e.g. `upload_content`, `manage_users`) rather than a single fixed role. See `backend/src/modules/permissions/`.
- **Contracts drive teacher access** — a teacher can only upload content while they have an active contract with a Coaching Class. See `backend/src/modules/contracts/` and `backend/src/jobs/contractExpiry.job.js`.
- **Views vs. Retention** — a "view" is counted once per student; "retention" counts every replay. Teachers see only views; Coaching Class admins see both. See `backend/src/modules/analytics/`.
- **Revenue split is per-contract** — paid course revenue splits between teacher and coaching class based on the % set in their specific contract, not a platform-wide rule. See `backend/src/modules/revenue/`.
- **Single-device login** — a student can only be logged in on one device at a time; switching devices requires OTP verification. See `backend/src/modules/auth/deviceSession.service.js` and `otp.service.js`.

## Status

Currently in early development — Phase 1 (auth, users, permissions) in progress.