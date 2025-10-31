import { NextRequest, NextResponse } from "next/server"

// Proxy to backend API
const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:3131/api"

export async function POST(req: NextRequest) {
  try {
    const pathSegments = req.nextUrl.pathname.split("/")
    const endpoint = pathSegments.slice(3).join("/") // Get everything after /api/auth/

    const body = await req.json()

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    
    const authHeader = req.headers.get("authorization")
    if (authHeader) {
      headers.Authorization = authHeader
    }

    const response = await fetch(`${BACKEND_URL}/auth/${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("POST /api/auth/* proxy error:", errorMessage)
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const pathSegments = req.nextUrl.pathname.split("/")
    const endpoint = pathSegments.slice(3).join("/")
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/auth/${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("GET /api/auth/* proxy error:", errorMessage)
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 })
  }
}
