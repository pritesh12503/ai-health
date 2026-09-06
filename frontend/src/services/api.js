import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
})

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

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (name, email, password) => api.post('/auth/signup', { name, email, password }),
  me: () => api.get('/auth/me'),
}

export const triageService = {
  analyze: (symptoms) => api.post('/triage', { symptoms }),
  getHistory: () => api.get('/triage/history'),
  getById: (id) => api.get(`/triage/${id}`),
}

export const prescriptionService = {
  explain: (prescription_text, patient_id = null, is_voice_entry = false) =>
    api.post('/prescriptions/explain', { prescription_text, patient_id, is_voice_entry }),
  getHistory: () => api.get('/prescriptions/history'),
  getById: (id) => api.get(`/prescriptions/${id}`),
}

export const userService = {
  updateProfile: (data) => api.put('/users/me', data),
  changePassword: (data) => api.put('/users/me/password', data),
  getDashboard: () => api.get('/users/me/dashboard'),
  getHistory: () => api.get('/users/me/history'),   // ← used by History page
}

export const reminderService = {
  create: (medication_name, dose_times) =>
    api.post('/reminders', { medication_name, dose_times }),
  getAll: () => api.get('/reminders'),
  delete: (id) => api.delete(`/reminders/${id}`),
}

export const patientService = {
  create: (data) => api.post('/patients', data),
  list: () => api.get('/patients'),
  getById: (id) => api.get(`/patients/${id}`),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
  getHistory: (id) => api.get(`/patients/${id}/history`),
}

export default api
