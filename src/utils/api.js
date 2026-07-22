// Central API base URL
// - In development: Vite proxy forwards /api → localhost:5000 (no env var needed)
// - In production (Vercel): VITE_API_URL must be set to your Render backend URL
const API_BASE = import.meta.env.VITE_API_URL || ''

export default API_BASE
