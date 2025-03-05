"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import api from "../utils/api"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token")

        if (token) {
          // Set default auth header
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`

          // Get user profile
          const response = await api.get("/api/users/profile")
          setUser(response.data)
        }
      } catch (err) {
        console.error("Error loading user:", err)
        localStorage.removeItem("token")
        delete api.defaults.headers.common["Authorization"]
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  // Register user
  const register = async (userData) => {
    try {
      setError(null)
      const response = await api.post("/api/users/register", userData)

      // Save token and user data
      localStorage.setItem("token", response.data.token)
      api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`
      setUser(response.data.user)

      navigate("/")
      return response.data
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed")
      throw err
    }
  }

  // Login user
  const login = async (credentials) => {
    try {
      setError(null)
      const response = await api.post("/api/users/login", credentials)

      // Save token and user data
      localStorage.setItem("token", response.data.token)
      api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`
      setUser(response.data.user)

      navigate("/")
      return response.data
    } catch (err) {
      setError(err.response?.data?.error || "Login failed")
      throw err
    }
  }

  // Logout user
  const logout = () => {
    localStorage.removeItem("token")
    delete api.defaults.headers.common["Authorization"]
    setUser(null)
    navigate("/login")
  }

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

