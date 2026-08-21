# Campus Idea & Innovation Hub

A full-stack MERN application where students submit, vote on, and track campus ideas through a lifecycle from **Submitted** to **Implemented**.

- **Frontend:** React 19 (Vite), React Router 7, Tailwind CSS v4, Framer Motion, Axios
- **Backend:** Node.js, Express 5, Mongoose 9, JWT auth, bcrypt, express-validator
- **Database:** MongoDB (Atlas in production, local `mongod` for development)

**Live demo:** _add deployed URL here_

---

## Architecture

```
┌─────────────────────┐        HTTPS / JSON        ┌──────────────────────┐        ┌─────────────┐
│   React SPA (Vite)  │  ─────────────────────────► │   Express REST API   │ ─────► │   MongoDB   │
│  localhost:5173      │ ◄───────────────────────── │   localhost:5000      │ ◄───── │   (Atlas)    │
└─────────────────────┘     Authorization: Bearer   └──────────────────────┘        └─────────────┘
        │                          <JWT>                       │
        │                                                      │
  React Router (client routes)                        Mongoose ODM
  Context API (auth + toasts)                          - User model (bcrypt-hashed password)
  Axios instance w/ interceptor                          - Idea model (text index for search)
  localStorage (JWT + bookmarks cache)               express-validator (field-level validation)
                                                       JWT middleware (protect / identify / requireRole)
```

**Request flow for a protected action (e.g. voting):**
1. User clicks the vote button in `VoteButton.jsx` → optimistic UI update fires immediately.
2. Axios attaches `Authorization: Bearer <token>` from `localStorage` via a request interceptor (`src/api/axios.js`).
3. Express's `protect` middleware (`backend/src/middleware/auth.js`) verifies the JWT and loads `req.user`.
4. The controller (`voteIdea` in `ideaController.js`) performs a single atomic `findOneAndUpdate` with `votedBy: { $ne: userId }` in the filter — this is what makes duplicate-vote prevention race-safe instead of a read-then-write check.
5. The response reconciles the optimistic UI; on error, the UI rolls back.

**Auth model:** stateless JWT (7-day expiry), password hashed with bcrypt (10 salt rounds), token stored in `localStorage` and attached per-request — no server-side session store. `GET /api/auth/me` re-validates the token on app load so a stale/expired token is cleared automatically rather than trusting the cached user forever.

**Authorization layers:**
- `protect` — hard gate, 401s without a valid token.
- `identify` — soft gate on public routes (feed, idea detail), so responses can include `hasVoted` / `isOwner` for a logged-in caller without forcing login to browse.
- `requireRole('reviewer')` — gates the lifecycle status-advance endpoint separately from ownership.

Every one of these checks is enforced in the Express controllers, not just hidden in the UI — the frontend hiding Edit/Delete/Advance buttons is a UX nicety, not the actual security boundary.

---

## Project structure

```
FSD_ETE/
├── backend/            Express API
│   ├── src/
│   │   ├── config/      MongoDB connection
│   │   ├── models/      User, Idea (Mongoose schemas)
│   │   ├── controllers/ Route handlers
│   │   ├── routes/      Express routers
│   │   ├── middleware/  auth, validation, error handling
│   │   └── utils/       ApiError, asyncHandler, seed script
│   └── .env.example
└── frontend/            React app (Vite)
    └── src/
        ├── api/          axios instance + endpoint wrappers
        ├── components/   reusable UI (IdeaCard, IdeaForm, VoteButton, ...)
        ├── pages/         route-level views
        ├── context/       AuthContext, ToastContext
        ├── hooks/         useBookmarks
        └── utils/         constants, error parsing
```

---

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env   # then edit .env, see below
npm run seed            # optional: populate sample users + ideas
npm run dev              # starts on http://localhost:5000
```

### Environment variables (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | MongoDB connection string. For Atlas: create a free cluster, a database user, allow your IP under Network Access, then copy the `mongodb+srv://...` URI. For local dev, `mongodb://127.0.0.1:27017/campus-idea-hub` works if `mongod` is running. |
| `JWT_SECRET` | Any long random string (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLIENT_URL` | Frontend origin, for CORS (default `http://localhost:5173`) |

### Seed data

`npm run seed` clears the `ideas` and `users` collections and creates 4 users and 12 sample ideas.

- **Reviewer** (can advance idea status): `asha@campus.edu` / `Password123`
- **Student**: `rohan@campus.edu` / `Password123` (also `priya@campus.edu`, `karan@campus.edu`)

---

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # defaults already point at localhost:5000
npm run dev              # starts on http://localhost:5173
```

Run the backend first — the frontend expects `VITE_API_URL` (default `http://localhost:5000/api`) to be reachable.

---

## 3. Running both together

Open two terminals:

```bash
# terminal 1
cd backend && npm run dev

# terminal 2
cd frontend && npm run dev
```

Visit `http://localhost:5173`.

---

## 4. API reference

Base URL: `http://localhost:5000/api`

All responses share the shape `{ success, message?, data?, meta?, errors? }`. Validation failures return `400` with `errors: { field: message }`.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | `{ name, email, password }` → user + JWT |
| POST | `/auth/login` | — | `{ email, password }` → user + JWT |
| GET | `/auth/me` | required | Current user (used to rehydrate session on reload) |
| PATCH | `/auth/bookmarks/:id` | required | Toggle a bookmark on an idea |

### Ideas

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/ideas` | optional | List ideas. Query: `search`, `domain`, `status`, `technology`, `sort` (`newest`\|`oldest`\|`votes`), `page`, `limit` |
| GET | `/ideas/:id` | optional | Single idea |
| POST | `/ideas` | required | Create an idea |
| PUT | `/ideas/:id` | owner only | Update an idea |
| DELETE | `/ideas/:id` | owner only | Delete an idea |
| PATCH | `/ideas/:id/vote` | required | Cast a vote (rejects duplicates) |
| DELETE | `/ideas/:id/vote` | required | Remove your vote |
| PATCH | `/ideas/:id/status` | reviewer role | Advance lifecycle status (forward-only) |
| GET | `/ideas/meta/options` | — | Valid `domains` / `statuses` enums |
| GET | `/ideas/meta/stats` | optional | Dashboard aggregates (totals, by status, by domain, top-voted) |
| GET | `/ideas/meta/bookmarks` | required | Current user's bookmarked ideas |
| GET | `/ideas/meta/mine` | required | Current user's submitted ideas |

### Idea lifecycle

```
Submitted → Under Review → Approved → Prototype → Implemented
```

Only users with `role: "reviewer"` can advance status, and only forward (no skipping back a stage). The demo seed marks `asha@campus.edu` as a reviewer; every other seeded account is a regular student.

---

## 5. Key design decisions

- **Ownership & roles enforced server-side.** Every mutating idea route re-checks ownership (or reviewer role) in the controller — the frontend hides buttons for UX, but the API is the actual gate.
- **Duplicate votes prevented atomically.** The vote endpoint uses a single `findOneAndUpdate` with `votedBy: { $ne: userId }` in the filter, so two simultaneous requests from the same user cannot both succeed (no read-then-write race).
- **Optimistic UI, server-reconciled.** Voting and bookmarking update the UI immediately, then reconcile with (or roll back to) the server's response.
- **Bookmarks work for anonymous users** via `localStorage`; on login, the server-side list becomes the source of truth and is mirrored back into `localStorage`.
- **Text + regex search combined.** MongoDB's `$text` index handles whole-word ranking; a case-insensitive regex `$or` across `title`/`problemStatement`/`technologies` also catches partial matches from an incremental search box.

---

## 6. Scripts

**Backend** (`backend/package.json`)
- `npm run dev` — nodemon dev server
- `npm start` — production start
- `npm run seed` — reset & seed sample data

**Frontend** (`frontend/package.json`)
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build

---

## 7. Verification checklist

For evaluating end-to-end functionality:

1. **Auth** — register a new account, then log out and log back in with `rohan@campus.edu` / `Password123`. Reload the page while logged in and confirm the session survives (via `GET /auth/me`).
2. **Validation** — try submitting an idea with a problem statement under 50 characters; the submit button stays disabled and an inline error explains why. Try registering with a short password; the server also rejects it independently (open devtools → Network to see the `400` even if you bypass the client check).
3. **CRUD + ownership** — submit an idea, edit it, then try opening `/edit/<that-id>` while logged in as a *different* user — the server returns `403`.
4. **Voting** — vote on an idea, refresh the page, confirm the vote persisted and a second vote attempt is rejected server-side (`409`). Log out and try to vote — you're prompted to log in instead of hitting the API.
5. **Search / filter / sort / pagination** — combine a domain filter, a status filter, and a search keyword at once; confirm the URL's query string updates and the result count in the pagination footer matches.
6. **Lifecycle** — log in as the reviewer (`asha@campus.edu` / `Password123`), open any idea, and use "Advance to …" to move it through the lifecycle. Log in as a non-reviewer and confirm that control is absent.
7. **Dashboard** — `/stats` should reflect the same numbers as manually counting idea statuses/domains in the feed.
8. **Mobile** — resize the browser under ~768px width; the navbar collapses to a hamburger menu and the idea grid becomes single-column.
