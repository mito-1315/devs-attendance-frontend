/**
 * Centralised API base URL for all fetch calls.
 *
 * Priority:
 *  1. VITE_API_URL  — set per-environment in .env (local dev or platform override)
 *  2. Falls back to localhost for convenience during development
 *
 * In production (Railway / any platform):
 *   Set VITE_API_URL to your deployed backend URL in the platform's env var settings,
 *   e.g. https://devs-attendance-production.up.railway.app/api
 */
const API_BASE_URL: string =
    import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default API_BASE_URL;
