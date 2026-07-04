import axios from 'axios'
import { dispatchAuthLogout } from './authEvents'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Token expired or invalid - clear and notify the React tree to redirect.
      // We dispatch a CustomEvent instead of using window.location.href so the
      // navigation goes through React Router (no full page reload, in-memory
      // state is preserved).
      localStorage.removeItem('token')
      dispatchAuthLogout()
    }
    return Promise.reject(error)
  }
)

export default api
