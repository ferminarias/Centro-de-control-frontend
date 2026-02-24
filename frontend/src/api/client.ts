import axios from "axios"

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  timeout: 30_000, // 30 seconds
})

// Add auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Track if a token refresh is already in progress to avoid infinite loops
let isRefreshing = false
let pendingRequests: Array<(token: string) => void> = []

function onTokenRefreshed(newToken: string) {
  pendingRequests.forEach((cb) => cb(newToken))
  pendingRequests = []
}

function addPendingRequest(cb: (token: string) => void) {
  pendingRequests.push(cb)
}

function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("refresh_token")
  window.location.href = "/login"
}

// Handle auth errors — attempt refresh before logging out
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Not a 401 or already retried — just reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Skip refresh for the auth endpoints themselves
    const url: string = originalRequest.url ?? ""
    if (url.includes("/auth/login") || url.includes("/auth/refresh")) {
      logout()
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) {
      logout()
      return Promise.reject(error)
    }

    // If a refresh is already running, queue this request
    if (isRefreshing) {
      return new Promise((resolve) => {
        addPendingRequest((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          resolve(apiClient(originalRequest))
        })
      })
    }

    // Start the refresh
    isRefreshing = true
    originalRequest._retry = true

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/v1/auth/refresh`,
        null,
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      )

      const newToken: string = data.access_token
      localStorage.setItem("token", newToken)

      // Retry all queued requests with the new token
      onTokenRefreshed(newToken)

      // Retry the original request
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return apiClient(originalRequest)
    } catch {
      // Refresh failed — log out completely
      logout()
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

export { apiClient }
export default apiClient
