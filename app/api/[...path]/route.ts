import { NextRequest, NextResponse } from "next/server"

// Proxy to backend API
const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:3131/api"

async function proxyRequest(
  req: NextRequest,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
): Promise<NextResponse> {
  try {
    // Extract the path after /api
    const url = new URL(req.url)
    const pathSegments = url.pathname.split("/")
    const endpoint = pathSegments.slice(3).join("/") // Get everything after /api/

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    const authHeader = req.headers.get("authorization")
    if (authHeader) {
      headers.Authorization = authHeader
    }

    const backendUrl = `${BACKEND_URL}/${endpoint}${url.search}`

    const fetchOptions: RequestInit = {
      method,
      headers,
    }

    if (method !== "GET" && method !== "DELETE") {
      const body = await req.text()
      if (body) {
        fetchOptions.body = body
      }
    }

    const response = await fetch(backendUrl, fetchOptions)

    if (!response.ok) {
      let errorData: unknown
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: response.statusText }
      }
      return NextResponse.json(errorData, { status: response.status })
    }

    let data: unknown
    try {
      data = await response.json()
    } catch {
      const text = await response.text()
      data = text || { success: true }
    }

    return NextResponse.json(data)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`${method} /api/* proxy error:`, errorMessage)
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return proxyRequest(req, "GET")
}

export async function POST(req: NextRequest) {
  return proxyRequest(req, "POST")
}

export async function PUT(req: NextRequest) {
  return proxyRequest(req, "PUT")
}

export async function DELETE(req: NextRequest) {
  return proxyRequest(req, "DELETE")
}

export async function PATCH(req: NextRequest) {
  return proxyRequest(req, "PATCH")
}
