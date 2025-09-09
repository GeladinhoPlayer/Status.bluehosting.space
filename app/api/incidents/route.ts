export async function GET() {
  const incidents = [
    {
      id: "1",
      title: "Lentidão no painel de controle",
      description: "Alguns usuários podem experimentar lentidão ao acessar o painel de controle devido a alta demanda",
      status: "resolved",
      severity: "minor",
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      affectedServices: ["2"],
      updates: [
        {
          time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          message: "Identificamos lentidão no painel de controle. Nossa equipe está investigando.",
          status: "investigating",
        },
        {
          time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          message: "Problema identificado como sobrecarga no servidor. Implementando correção.",
          status: "identified",
        },
        {
          time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          message: "Problema resolvido. Todos os serviços funcionando normalmente.",
          status: "resolved",
        },
      ],
    },
    {
      id: "2",
      title: "Instabilidade na conexão com banco de dados",
      description: "Intermitência na conexão com o banco de dados principal afetando alguns serviços",
      status: "resolved",
      severity: "major",
      startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
      affectedServices: ["1", "2"],
      updates: [
        {
          time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          message: "Detectada instabilidade na conexão com banco de dados. Investigando causa raiz.",
          status: "investigating",
        },
        {
          time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
          message: "Problema identificado como falha no hardware do servidor de banco. Migrando para servidor backup.",
          status: "identified",
        },
        {
          time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
          message: "Migração concluída com sucesso. Todos os serviços estão operacionais.",
          status: "resolved",
        },
      ],
    },
  ]

  return Response.json({ incidents })
}
