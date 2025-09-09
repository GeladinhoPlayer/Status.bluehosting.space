import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 })
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "BlueHosting-Status-Monitor/1.0",
      },
    })

    clearTimeout(timeoutId)

    return NextResponse.json({
      status: response.ok ? "operational" : "down",
      statusCode: response.status,
      responseTime: Date.now(),
    })
  } catch (error) {
    console.error("Status check failed:", error)
    return NextResponse.json(
      {
        status: "down",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
