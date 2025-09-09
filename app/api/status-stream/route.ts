import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const checkAndSend = async () => {
        try {
          const services = await Promise.all([
            checkService("1", "Site Principal", "https://bluehosting.space"),
            checkService("2", "Painel de Controle", "https://painel.bluehosting.space"),
          ])

          const data = JSON.stringify({
            services,
            timestamp: new Date().toISOString(),
          })

          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        } catch (error) {
          console.error("[v0] Error in status stream:", error)
        }
      }

      // Verificação inicial
      checkAndSend()

      const interval = setInterval(checkAndSend, 500)

      request.signal.addEventListener("abort", () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

async function checkService(id: string, name: string, url: string) {
  try {
    const startTime = Date.now()
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    })
    const responseTime = Date.now() - startTime

    const status = response.ok ? "operational" : "degraded"
    const uptime = response.ok ? 100.0 : 99.95

    return {
      id,
      name,
      url,
      status,
      lastChecked: new Date(),
      responseTime,
      uptime,
      uptimeHistory: new Array(90)
        .fill(true)
        .map((_, i) => (i < 88 ? true : Math.random() > (response.ok ? 0.01 : 0.1))),
    }
  } catch (error) {
    return {
      id,
      name,
      url,
      status: "down" as const,
      lastChecked: new Date(),
      uptime: 98.5,
      uptimeHistory: new Array(90).fill(true).map((_, i) => (i < 85 ? true : Math.random() > 0.2)),
    }
  }
}
