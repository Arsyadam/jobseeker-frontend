// apiClient.ts

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

interface PaginatedResponse<T> {
  success: boolean
  data: {
    items: T[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}

class ApiClient {
  private baseURL: string
  private fallbackURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3131/api"
    this.fallbackURL = "/api" // Next.js API routes as fallback
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  /**
   * Generic request handler with proper headers and error handling
   * Tries primary API first, then falls back to Next.js API routes
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Try primary API first
    try {
      return await this.makeRequest<T>(this.baseURL + endpoint, options);
    } catch (primaryError) {
      console.log("Primary API failed, trying fallback...");
      
      // Try fallback API (Next.js routes)
      try {
        return await this.makeRequest<T>(this.fallbackURL + endpoint, options);
      } catch (fallbackError) {
        console.error("Both primary and fallback APIs failed");
        throw primaryError; // Throw the original error
      }
    }
  }

  /**
   * Make the actual HTTP request
   */
  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {

    // Use Headers API to safely handle all header formats
    const headers = new Headers(options.headers)

    const isFormData = options.body instanceof FormData

    // Only set Content-Type if not FormData (fetch sets it automatically with boundary)
    if (!isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }

    // Add Authorization header if token exists
    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`)
      console.log("✅ Authorization header added to request")
    } else {
      console.warn("⚠️ No token available for API request")
    }

    console.log("API Request:", {
      method: options.method || "GET",
      url,
      hasToken: !!this.token,
      headers: Object.fromEntries(headers.entries()),
    })

    try {
      const response = await fetch(url, {
        ...options,
        headers, // Pass the Headers instance
      })

      console.log("API Response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      // Handle empty responses (e.g., 204 No Content)
      let data: ApiResponse<T>
      if (response.headers.get("Content-Length") !== "0") {
        data = await response.json()
      } else {
        data = { success: response.ok }
      }

      if (!response.ok) {
        console.error("API Error Response:", data)
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // ========================================
  // Authentication
  // ========================================
  async login(email: string, password: string, role: string) {
    return this.request<{
      user: any
      token: string
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    })
  }

  async register(userData: any) {
    return this.request<{
      user: any
      token: string
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    })
  }

  async verifyEmail(email: string, code: string) {
    return this.request("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    })
  }

  async resendVerificationCode(email: string) {
    return this.request("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async forgotPassword(email: string) {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, newPassword }),
    })
  }

  async changeEmail(newEmail: string, password: string) {
    return this.request("/auth/change-email", {
      method: "POST",
      body: JSON.stringify({ newEmail, password }),
    })
  }

  async verifyEmailChange(email: string, code: string) {
    return this.request("/auth/verify-email-change", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    })
  }

  // ========================================
  // Profile
  // ========================================
  async getProfile() {
    return this.request("/profile")
  }

  async updateProfile(profileData: any) {
    console.log('API updateProfile called with:', profileData);
    const response = await this.request("/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
    console.log('API updateProfile response:', response);
    return response;
  }

  async uploadProfilePhoto(file: File) {
    const formData = new FormData()
    formData.append("photo", file)

    return this.request("/profile/photo", {
      method: "POST",
      body: formData,
      // Don't set Content-Type — let fetch set it automatically
    })
  }

  // ========================================
  // CV Upload
  // ========================================
  async uploadCV(file: File) {
    const formData = new FormData()
    formData.append("cv", file)

    return this.request("/cv/upload", {
      method: "POST",
      body: formData,
    })
  }

  async getCVUploads() {
    return this.request("/cv/uploads")
  }

  // ========================================
  // Jobs
  // ========================================
  async getJobs(
    params: {
      search?: string
      category?: string
      experience?: string
      type?: string
      workMode?: string
      location?: string
      sortBy?: string
      page?: number
      limit?: number
    } = {}
  ) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value != null) searchParams.append(key, value.toString())
    })

    return this.request<PaginatedResponse<any>>(`/jobs?${searchParams}`)
  }

  async getJob(id: string) {
    return this.request(`/jobs/${id}`)
  }

  async createJob(jobData: any) {
    return this.request("/jobs", {
      method: "POST",
      body: JSON.stringify(jobData),
    })
  }

  async updateJob(id: string, jobData: any) {
    console.log("Updating job:", { id, jobData });
    try {
      const response = await this.request(`/jobs/${id}`, {
        method: "PUT",
        body: JSON.stringify(jobData),
      });
      console.log("Update job response:", response);
      return response;
    } catch (error) {
      console.error("Error in updateJob:", error);
      throw error;
    }
  }

  async deleteJob(id: string) {
    return this.request(`/jobs/${id}`, {
      method: "DELETE",
    })
  }

  async toggleJobStatus(id: string, isActive: boolean) {
    console.log("Toggling job status:", { id, isActive });
    try {
      const response = await this.request(`/jobs/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
      console.log("Toggle job status response:", response);
      return response;
    } catch (error) {
      console.error("Error in toggleJobStatus:", error);
      throw error;
    }
  }

  // ========================================
  // Applications
  // ========================================
  async applyToJob(applicationData: {
    jobId: string
    coverLetter?: string
    portfolioLinks?: string[]
    customAnswers?: any
  }) {
    return this.request("/applications", {
      method: "POST",
      body: JSON.stringify(applicationData),
    })
  }

  async getApplications(
    params: {
      jobId?: string
      status?: string
      page?: number
      limit?: number
    } = {}
  ) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value != null) searchParams.append(key, value.toString())
    })

    return this.request<PaginatedResponse<any>>(`/applications?${searchParams}`)
  }

  // ========================================
  // Saved Jobs
  // ========================================
  async saveJob(jobId: string) {
    return this.request("/saved-jobs", {
      method: "POST",
      body: JSON.stringify({ jobId }),
    })
  }

  async unsaveJob(jobId: string) {
    return this.request(`/saved-jobs/${jobId}`, {
      method: "DELETE",
    })
  }

  async getSavedJobs() {
    return this.request("/saved-jobs")
  }

  // ========================================
  // Notifications
  // ========================================
  async getNotifications(
    params: {
      unreadOnly?: boolean
      type?: string
      limit?: number
    } = {}
  ) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, value.toString())
    })

    return this.request(`/notifications?${searchParams}`)
  }

  async markNotificationsAsRead(notificationIds: string[]) {
    return this.request("/notifications", {
      method: "PUT",
      body: JSON.stringify({
        notificationIds,
        markAsRead: true,
      }),
    })
  }

  // ========================================
  // AI Features
  // ========================================
  async getJobMatches() {
    return this.request("/ai/job-matches")
  }

  async generateProfileSummary() {
    return this.request("/ai/profile-summary", {
      method: "POST",
    })
  }

  // ========================================
  // Analytics
  // ========================================
  async getProfileAnalytics() {
    return this.request("/analytics/profile")
  }

  async getJobAnalytics(jobId: string) {
    return this.request(`/analytics/jobs/${jobId}`)
  }

  // ========================================
  // Companies
  // ========================================
  async getCompanies(
    params: {
      search?: string
      industry?: string
      size?: string
      location?: string
      page?: number
      limit?: number
    } = {}
  ) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value != null) searchParams.append(key, value.toString())
    })

    return this.request<PaginatedResponse<any>>(`/companies?${searchParams}`)
  }

  async getCompany(id: string) {
    return this.request(`/companies/${id}`)
  }

  // ========================================
  // Talent
  // ========================================
  async getTalent(
    params: {
      search?: string
      skills?: string
      experience?: string
      location?: string
      availability?: string
      page?: number
      limit?: number
    } = {}
  ) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value != null) searchParams.append(key, value.toString())
    })

    return this.request<PaginatedResponse<any>>(`/talent?${searchParams}`)
  }

  async getTalentProfile(id: string) {
    return this.request(`/talent/${id}`)
  }
}

// Export a singleton instance
export const apiClient = new ApiClient()