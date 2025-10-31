import { NextRequest, NextResponse } from "next/server"

// Proxy to backend API
const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:3131/api"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const response = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("POST /api/auth/register proxy error:", errorMessage)
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 })
  }
}
