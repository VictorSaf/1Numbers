// Single source of truth for where the backend API lives.
//
// Production serves the static build and the API from the same origin
// (compass.oneaigency.com), with the Cloudflare Tunnel routing /api/* to the
// backend. Development matches that shape via the Vite proxy in vite.config.ts.
// A relative base is therefore correct in both, and no host is ever baked into
// the bundle at build time.
//
// VITE_API_URL overrides this only for deployments where the API is on another
// origin. It must include the /api suffix, e.g. https://api.example.com/api
export const API_BASE = import.meta.env.VITE_API_URL || '/api';
