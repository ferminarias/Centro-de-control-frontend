import axios from "axios"

const BASE = import.meta.env.VITE_API_URL || "https://web-production-7d1a.up.railway.app"

const prodeClient = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
})

prodeClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("prode_token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

prodeClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("prode_token")
      window.location.href = "/prode/login"
    }
    return Promise.reject(error)
  }
)

export default prodeClient
