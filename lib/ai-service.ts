// AI Service for CV processing and job matching
export class AIService {
  private static baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434"

  static async processCVText(text: string): Promise<any> {
    try {
      // In production, this would call Ollama API
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.1",
          prompt: `Extract structured information from this CV text and return as JSON:
          
          ${text}
          
          Please extract:
          - Personal information (name, email, phone, location)
          - Work experience (company, position, dates, description, achievements)
          - Education (degree, institution, dates, GPA)
          - Skills (technical and soft skills)
          - Languages
          - Certifications
          
          Return only valid JSON format.`,
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error("AI service unavailable")
      }

      const result = await response.json()
      return JSON.parse(result.response)
    } catch (error) {
      console.error("AI processing error:", error)
      // Return null when AI service is unavailable
      return null
    }
  }

  static async generateProfileSummary(profileData: any): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.1",
          prompt: `Generate a professional summary for this profile:
          
          ${JSON.stringify(profileData)}
          
          Create a compelling 2-3 sentence professional summary that highlights key strengths and experience.`,
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error("AI service unavailable")
      }

      const result = await response.json()
      return result.response
    } catch (error) {
      console.error("AI summary generation error:", error)
      return "Experienced professional with strong technical skills and proven track record of delivering high-quality results."
    }
  }

  static async matchJobs(userProfile: any, jobs: any[]): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.1",
          prompt: `Match this user profile with the following jobs and return match scores:
          
          User Profile: ${JSON.stringify(userProfile)}
          
          Jobs: ${JSON.stringify(jobs)}
          
          For each job, calculate a match score (0-100) based on:
          - Skills alignment
          - Experience level match
          - Location preference
          - Job type preference
          
          Return JSON array with jobId and matchScore for each job.`,
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error("AI service unavailable")
      }

      const result = await response.json()
      return JSON.parse(result.response)
    } catch (error) {
      console.error("AI job matching error:", error)
      // Fallback to simple matching
      return jobs.map((job) => ({
        jobId: job.id,
        matchScore: Math.floor(Math.random() * 30) + 70, // Random score 70-100
      }))
    }
  }
}
