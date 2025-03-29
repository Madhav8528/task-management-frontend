import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:7240",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If the error is 401 and we haven't already tried to refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        await axios.post("/api/v1/user/refresh-access-token", {}, { withCredentials: true })

        // If successful, retry the original request
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default api

