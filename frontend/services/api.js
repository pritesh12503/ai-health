import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30s for ML calls
})

// Response interceptor — handle 401s globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (name, email, password) => api.post('/auth/signup', { name, email, password }),
  me: () => api.get('/auth/me'),
}

// ── Triage ────────────────────────────────────────
export const triageService = {
  analyze: (symptoms) => api.post('/triage', { symptoms }),
  getHistory: () => api.get('/triage/history'),
  getById: (id) => api.get(`/triage/${id}`),
}

// ── Prescription ──────────────────────────────────
export const prescriptionService = {
  explain: (prescription_text) => api.post('/prescriptions/explain', { prescription_text }),
  getHistory: () => api.get('/prescriptions/history'),
  getById: (id) => api.get(`/prescriptions/${id}`),
}

// ── User ──────────────────────────────────────────
export const userService = {
  updateProfile: (data) => api.put('/users/me', data),
  changePassword: (data) => api.put('/users/me/password', data),
  getDashboard: () => api.get('/users/me/dashboard'),
}

export default api
