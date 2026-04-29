# Frontend — DevS Attendance

React + TypeScript SPA for the DevS Attendance System, built with Vite and styled with Tailwind CSS + shadcn/ui.

---

## Table of Contents

- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [Route Guards](#route-guards)
- [Auth Service](#auth-service)
- [API Configuration](#api-configuration)
- [Tech Stack](#tech-stack)

---

## Setup

```bash
cd frontend
npm install
```

Create a `frontend/.env` file (see [Environment Variables](#environment-variables)).

---

## Environment Variables

```env
VITE_API_URL=http://localhost:3000/api
```

In production, set `VITE_API_URL` to your deployed backend URL, e.g.:

```env
VITE_API_URL=https://devs-attendance-production.up.railway.app/api
```

The variable is read in [`src/config/api.ts`](src/config/api.ts), which falls back to `http://localhost:3000/api` if unset.

---

## Running the App

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server at `http://localhost:5173` |
| `npm run build` | Production build → `build/` |
| `npm start` | Alias for `vite` (same as `dev`) |

---

## Project Structure

```
frontend/
├── index.html
├── vite.config.ts             # Vite config — SWC plugin, path aliases
├── tsconfig.json
├── vercel.json                # SPA redirect rule for Vercel deployment
└── src/
    ├── main.tsx               # React DOM entry point
    ├── App.tsx                # Router, layout, route guards
    ├── index.css
    ├── config/
    │   └── api.ts             # Centralised API base URL
    ├── services/
    │   └── auth.ts            # Login, logout, localStorage session helpers
    ├── components/
    │   ├── LoginPage.tsx      # /login
    │   ├── UploadPage.tsx     # /upload  (home after login)
    │   ├── AttendancePage.tsx # /attendance
    │   ├── HistoryPage.tsx    # /history
    │   ├── EventStatsBasics.tsx # /eventstats
    │   ├── ProfilePage.tsx    # /profile
    │   ├── CreateUserPage.tsx # /createuser  (admin only)
    │   ├── SessionPage.tsx    # redirects to /upload
    │   ├── figma/
    │   │   └── ImageWithFallback.tsx
    │   └── ui/                # shadcn/ui component library
    └── styles/
        └── globals.css
```

---

## Pages & Routes

| Path | Component | Access | Description |
|---|---|---|---|
| `/` | — | Public | Redirects to `/login` |
| `/login` | `LoginPage` | Public | Username + password authentication |
| `/upload` | `UploadPage` | Protected | Home page — validate and upload a Google Sheet for an event |
| `/attendance` | `AttendancePage` | Protected | Mark attendance for the active event sheet |
| `/history` | `HistoryPage` | Protected | Browse all past event records |
| `/eventstats` | `EventStatsBasics` | Protected | Visualised stats for a specific event |
| `/profile` | `ProfilePage` | Protected | Logged-in user's profile and session list |
| `/createuser` | `CreateUserPage` | Admin only | Create a new user account |
| `/session` | — | — | Redirects to `/upload` |

### Navigation state

Pages that need context receive it via React Router `location.state`:

- `/attendance` — receives `{ eventName, from }`
- `/eventstats` — receives `{ eventName, from }`

The `from` field is used by the Back button to return to the correct previous page (e.g. `/upload` or `/history` or `/profile`).

---

## Route Guards

Two guard components wrap protected routes in `App.tsx`:

### `ProtectedRoute`

Redirects to `/login` if the user is not authenticated (checked via `localStorage`).

### `AdminRoute`

Redirects to `/login` if not authenticated, or to `/upload` if the user is not an admin. Admin status is stored in `localStorage` as `isAdmin: true` after login.

---

## Auth Service

Located at [`src/services/auth.ts`](src/services/auth.ts). All authentication state lives in `localStorage` — there are no server-side sessions.

### Functions

| Function | Description |
|---|---|
| `login(username, password)` | Calls `POST /api/login`, caches user in `localStorage` on success |
| `logout()` | Clears both auth keys from `localStorage` |
| `isAuthenticated()` | Returns `true` if the auth cache key is `"true"` |
| `getCachedUser()` | Returns the parsed `User` object from `localStorage`, or `null` |
| `getAuthState()` | Returns `{ isAuthenticated, user }` — used by route guards and the layout |
| `createUser(...)` | Calls `POST /api/createuser` (admin action) |

### localStorage Keys

| Key | Value |
|---|---|
| `devs_attendance_auth` | `"true"` or `"false"` |
| `devs_attendance_user` | JSON-serialised `User` object |

### `User` interface

```ts
interface User {
  username: string;
  name?: string;
  email?: string;
  role?: string;
  isAdmin?: boolean;
}
```

---

## API Configuration

[`src/config/api.ts`](src/config/api.ts) exports a single `API_BASE_URL` constant used by all `fetch` calls throughout the app.

```ts
// Priority:
// 1. VITE_API_URL env var (set per environment)
// 2. Falls back to http://localhost:3000/api
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
export default API_BASE_URL;
```

---

## Tech Stack

| Library | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | — | Type safety |
| Vite + `@vitejs/plugin-react-swc` | 6 | Build tool and dev server |
| Tailwind CSS | — | Utility-first styling |
| shadcn/ui + Radix UI | — | Accessible component primitives |
| `react-router-dom` | 7 | Client-side routing |
| `react-hook-form` | 7 | Form state management |
| `recharts` | 2 | Charts and event stats visualisation |
| `sonner` | 2 | Toast notifications |
| `lucide-react` | — | Icon library |
| `next-themes` | — | Dark/light theme support |
| `embla-carousel-react` | — | Carousel component |
