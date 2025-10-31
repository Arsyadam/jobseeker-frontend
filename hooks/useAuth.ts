"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { apiClient } from "@/lib/api"

// Constants for localStorage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
} as const

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "JOBSEEKER" | "HRD"
  profileComplete: boolean
  profilePicture?: string
  companyName?: string
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: "JOBSEEKER" | "HRD"
  phone?: string
  companyName?: string
}

interface AuthState {
  user: User | null
  loading: boolean
  isLoggingIn: boolean
  isRegistering: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper functions for localStorage operations
const getStorageItem = (key: string): string | null => {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error)
    return null
  }
}

const setStorageItem = (key: string, value: string): void => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error)
  }
}

const removeStorageItem = (key: string): void => {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isLoggingIn: false,
    isRegistering: false,
    error: null,
  })

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      const token = getStorageItem(STORAGE_KEYS.AUTH_TOKEN)
      const userData = getStorageItem(STORAGE_KEYS.USER_DATA)

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData) as User
          setState(prevState => ({
            ...prevState,
            user: parsedUser,
            loading: false,
          }))
          apiClient.setToken(token)
        } catch (error) {
          console.error("Error parsing user data:", error)
          removeStorageItem(STORAGE_KEYS.AUTH_TOKEN)
          removeStorageItem(STORAGE_KEYS.USER_DATA)
          setState(prevState => ({
            ...prevState,
            loading: false,
            error: "Invalid stored user data",
          }))
        }
      } else {
        setState(prevState => ({
          ...prevState,
          loading: false,
        }))
      }
    }

    initializeAuth()
  }, [])

  const clearError = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      error: null,
    }))
  }, [])

  const login = useCallback(async (email: string, password: string, role: string) => {
    setState(prevState => ({
      ...prevState,
      isLoggingIn: true,
      error: null,
    }))

    try {
      const response = await apiClient.login(email, password, role)

      if (response.success && response.data) {
        const { user: userData, token } = response.data
        
        setState(prevState => ({
          ...prevState,
          user: userData,
          isLoggingIn: false,
        }))
        
        apiClient.setToken(token)
        setStorageItem(STORAGE_KEYS.AUTH_TOKEN, token)
        setStorageItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
      } else {
        throw new Error(response.error || "Login failed")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed"
      console.error("Login error:", error)
      
      setState(prevState => ({
        ...prevState,
        isLoggingIn: false,
        error: errorMessage,
      }))
      
      throw error
    }
  }, [])

  const register = useCallback(async (userData: RegisterData) => {
    setState(prevState => ({
      ...prevState,
      isRegistering: true,
      error: null,
    }))

    try {
      console.log("Registering user with data:", userData)
      const response = await apiClient.register(userData)
      console.log("Register response:", response)
      
      if (response.success && response.data) {
        const { user: newUser, token } = response.data
        console.log("Registration successful, user:", newUser)
        
        setState(prevState => ({
          ...prevState,
          user: newUser,
          isRegistering: false,
        }))
        
        apiClient.setToken(token)
        setStorageItem(STORAGE_KEYS.AUTH_TOKEN, token)
        setStorageItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newUser))
      } else {
        const errorMsg = response.error || response.message || "Registration failed"
        console.error("Registration error response:", response)
        throw new Error(errorMsg)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
      console.error("Registration error:", error)
      
      setState(prevState => ({
        ...prevState,
        isRegistering: false,
        error: errorMessage,
      }))
      
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setState(prevState => ({
        ...prevState,
        user: null,
        error: null,
      }))
      
      apiClient.clearToken()
      removeStorageItem(STORAGE_KEYS.AUTH_TOKEN)
      removeStorageItem(STORAGE_KEYS.USER_DATA)
    }
  }, [])

  const updateUser = useCallback((userData: Partial<User>) => {
    setState(prevState => {
      if (!prevState.user) return prevState

      const updatedUser = { ...prevState.user, ...userData }
      setStorageItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser))
      
      return {
        ...prevState,
        user: updatedUser,
      }
    })
  }, [])

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  }

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
