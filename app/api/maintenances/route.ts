export async function GET() {
  const maintenances = [
    {
      id: "1",
      title: "Manutenção programada do servidor",
      description: "Atualização de segurança nos servidores principais para melhorar a performance e segurança",
      status: "scheduled",
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      affectedServices: ["1", "2"],
    },
    {
      id: "2",
      title: "Atualização do painel de controle",
      description: "Implementação de novas funcionalidades no painel administrativo",
      status: "completed",
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
      affectedServices: ["2"],
    },
  ]

  return Response.json({ maintenances })
}
