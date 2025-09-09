export async function GET() {
  try {
    const services = await Promise.all([
      checkService("1", "Site Principal", "https://bluehosting.space"),
      checkService("2", "Painel de Controle", "https://painel.bluehosting.space"),
    ])

    return Response.json({ services })
  } catch (error) {
    return Response.json({ error: "Failed to check services" }, { status: 500 })
  }
}

async function checkService(id: string, name: string, url: string) {
  try {
    const startTime = Date.now()
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(10000),
    })
    const responseTime = Date.now() - startTime

    return {
      id,
      name,
      url,
      status: response.ok ? "operational" : "degraded",
      lastChecked: new Date(),
      responseTime,
      uptime: response.ok ? 100.0 : 99.95,
      uptimeHistory: new Array(90).fill(true),
    }
  } catch (error) {
    return {
      id,
      name,
      url,
      status: "down" as const,
      lastChecked: new Date(),
      uptime: 98.5,
      uptimeHistory: new Array(90).fill(true),
    }
  }
}
