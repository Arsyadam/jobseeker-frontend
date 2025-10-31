import { NextRequest, NextResponse } from "next/server"

// Proxy to backend API
const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:3131/api"

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/profile`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("GET /api/profile proxy error:", errorMessage)
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const response = await fetch(`${BACKEND_URL}/profile`, {
      method: "PUT",
      headers: {
        Authorization: authHeader,
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
    console.error("PUT /api/profile proxy error:", errorMessage)
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 })
  }
}
