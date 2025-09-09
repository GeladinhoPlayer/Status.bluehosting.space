"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, CheckCircle, Clock, Calendar, AlertTriangle, Menu, X } from "lucide-react"
import Image from "next/image"

interface Service {
  id: string
  name: string
  url: string
  status: "operational" | "degraded" | "down"
  lastChecked: Date
  responseTime?: number
  uptime: number
  uptimeHistory: boolean[]
}

interface Maintenance {
  id: string
  title: string
  description: string
  status: "scheduled" | "in-progress" | "completed"
  startTime: Date
  endTime: Date
  affectedServices: string[]
}

interface Incident {
  id: string
  title: string
  description: string
  status: "investigating" | "identified" | "monitoring" | "resolved"
  severity: "minor" | "major" | "critical"
  startTime: Date
  endTime?: Date
  updates: Array<{
    time: Date
    message: string
    status: string
  }>
  affectedServices: string[]
}

export default function StatusPage() {
  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      name: "Site Principal",
      url: "https://bluehosting.space",
      status: "operational",
      lastChecked: new Date(),
      responseTime: 245,
      uptime: 100.0,
      uptimeHistory: new Array(90).fill(true),
    },
    {
      id: "2",
      name: "Painel de Controle",
      url: "https://painel.bluehosting.space",
      status: "operational",
      lastChecked: new Date(),
      responseTime: 312,
      uptime: 99.95,
      uptimeHistory: new Array(90).fill(true).map((_, i) => (i < 88 ? true : Math.random() > 0.1)),
    },
  ])

  const [maintenances, setMaintenances] = useState<Maintenance[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])

  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [showIncidentModal, setShowIncidentModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const eventSource = new EventSource("/api/status-stream")

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setServices(data.services)
      console.log("[v0] Status atualizado via SSE:", new Date().toLocaleTimeString())
    }

    eventSource.onerror = () => {
      console.log("[v0] SSE connection error, falling back to polling")
      eventSource.close()

      // Fallback para polling mais agressivo (500ms)
      const interval = setInterval(checkServices, 500)
      return () => clearInterval(interval)
    }

    loadMaintenances()
    loadIncidents()

    return () => eventSource.close()
  }, [])

  const checkServices = async () => {
    try {
      const response = await fetch("/api/check-all-services")
      const data = await response.json()
      setServices(data.services)
      console.log("[v0] Status atualizado via polling:", new Date().toLocaleTimeString())
    } catch (error) {
      console.error("[v0] Error checking services:", error)
    }
  }

  const loadMaintenances = async () => {
    try {
      const response = await fetch("/api/maintenances")
      const data = await response.json()
      setMaintenances(
        data.maintenances.map((m: any) => ({
          ...m,
          startTime: new Date(m.startTime),
          endTime: new Date(m.endTime),
        })),
      )
    } catch (error) {
      console.error("[v0] Error loading maintenances:", error)
    }
  }

  const loadIncidents = async () => {
    try {
      const response = await fetch("/api/incidents")
      const data = await response.json()
      setIncidents(
        data.incidents.map((i: any) => ({
          ...i,
          startTime: new Date(i.startTime),
          endTime: i.endTime ? new Date(i.endTime) : undefined,
          updates: i.updates.map((u: any) => ({
            ...u,
            time: new Date(u.time),
          })),
        })),
      )
    } catch (error) {
      console.error("[v0] Error loading incidents:", error)
    }
  }

  const getStatusIcon = (status: Service["status"]) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case "degraded":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "down":
        return <AlertCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusBadge = (status: Service["status"]) => {
    switch (status) {
      case "operational":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">Operacional</Badge>
        )
      case "degraded":
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50">Degradado</Badge>
      case "down":
        return <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">Fora do Ar</Badge>
    }
  }

  const UptimeChart = ({ history }: { history: boolean[] }) => (
    <div className="flex gap-1 items-end h-8">
      {history.map((isUp, index) => (
        <div
          key={index}
          className={`w-1 h-6 rounded-sm ${isUp ? "bg-emerald-500" : "bg-red-500"}`}
          title={`Dia ${index + 1}: ${isUp ? "Online" : "Offline"}`}
        />
      ))}
    </div>
  )

  const overallStatus = services.every((s) => s.status === "operational")
    ? "operational"
    : services.some((s) => s.status === "down")
      ? "down"
      : "degraded"

  const activeMaintenance = maintenances.filter((m) => m.status === "in-progress" || m.status === "scheduled").length
  const activeIncidents = incidents.filter((i) => i.status !== "resolved").length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/bluehosting-logo.png"
                alt="BlueHosting"
                width={200}
                height={60}
                className="h-12 w-auto sm:h-16 md:h-20"
                priority
              />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 hidden sm:block">Status</h1>
            </div>

            <nav className="hidden md:flex gap-6">
              <a href="#" className="text-gray-900 font-medium">
                Status
              </a>
              <Button
                variant="ghost"
                onClick={() => setShowMaintenanceModal(true)}
                className="text-gray-500 hover:text-gray-900 p-0 h-auto font-normal"
              >
                Manutenção{" "}
                {activeMaintenance > 0 && <Badge className="ml-2 bg-blue-100 text-blue-800">{activeMaintenance}</Badge>}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowIncidentModal(true)}
                className="text-gray-500 hover:text-gray-900 p-0 h-auto font-normal"
              >
                Incidentes{" "}
                {activeIncidents > 0 && <Badge className="ml-2 bg-red-100 text-red-800">{activeIncidents}</Badge>}
              </Button>
            </nav>

            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t">
              <nav className="flex flex-col gap-4">
                <a href="#" className="text-gray-900 font-medium">
                  Status
                </a>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowMaintenanceModal(true)
                    setMobileMenuOpen(false)
                  }}
                  className="text-gray-500 hover:text-gray-900 justify-start p-0 h-auto font-normal"
                >
                  Manutenção{" "}
                  {activeMaintenance > 0 && (
                    <Badge className="ml-2 bg-blue-100 text-blue-800">{activeMaintenance}</Badge>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowIncidentModal(true)
                    setMobileMenuOpen(false)
                  }}
                  className="text-gray-500 hover:text-gray-900 justify-start p-0 h-auto font-normal"
                >
                  Incidentes{" "}
                  {activeIncidents > 0 && <Badge className="ml-2 bg-red-100 text-red-800">{activeIncidents}</Badge>}
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-full mb-4">
            {getStatusIcon(overallStatus)}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {overallStatus === "operational" ? "Todos os serviços estão online" : "Problemas detectados"}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            Última atualização em {new Date().toLocaleDateString("pt-BR")} às{" "}
            {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} BRT
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm text-gray-500">Monitoramento em tempo real</span>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg border p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">{service.name}</h3>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <span className="text-emerald-600 font-medium text-sm sm:text-base">
                    {service.uptime.toFixed(2)}% de uptime
                  </span>
                  {getStatusBadge(service.status)}
                </div>
              </div>

              <div className="mb-4 overflow-x-auto">
                <UptimeChart history={service.uptimeHistory} />
              </div>

              <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                <span>há 90 dias</span>
                <span>Hoje</span>
              </div>

              {service.responseTime && (
                <div className="mt-4 text-xs sm:text-sm text-gray-600">Tempo de resposta: {service.responseTime}ms</div>
              )}
            </div>
          ))}
        </div>
      </main>

      <Dialog open={showMaintenanceModal} onOpenChange={setShowMaintenanceModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              Manutenções Programadas
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {maintenances.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm sm:text-base">Nenhuma manutenção programada</p>
            ) : (
              maintenances.map((maintenance) => (
                <div key={maintenance.id} className="border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">{maintenance.title}</h3>
                    <Badge
                      className={`text-xs ${
                        maintenance.status === "scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : maintenance.status === "in-progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {maintenance.status === "scheduled"
                        ? "Agendada"
                        : maintenance.status === "in-progress"
                          ? "Em andamento"
                          : "Concluída"}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3 text-sm">{maintenance.description}</p>
                  <div className="text-xs sm:text-sm text-gray-500 space-y-1">
                    <p>Início: {maintenance.startTime.toLocaleString("pt-BR")}</p>
                    <p>Fim: {maintenance.endTime.toLocaleString("pt-BR")}</p>
                    <p>
                      Serviços afetados:{" "}
                      {maintenance.affectedServices.map((id) => services.find((s) => s.id === id)?.name).join(", ")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showIncidentModal} onOpenChange={setShowIncidentModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              Incidentes
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {incidents.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm sm:text-base">Nenhum incidente registrado</p>
            ) : (
              incidents.map((incident) => (
                <div key={incident.id} className="border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">{incident.title}</h3>
                    <div className="flex gap-2 flex-wrap">
                      <Badge
                        className={`text-xs ${
                          incident.severity === "critical"
                            ? "bg-red-100 text-red-800"
                            : incident.severity === "major"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {incident.severity === "critical"
                          ? "Crítico"
                          : incident.severity === "major"
                            ? "Maior"
                            : "Menor"}
                      </Badge>
                      <Badge
                        className={`text-xs ${
                          incident.status === "resolved"
                            ? "bg-green-100 text-green-800"
                            : incident.status === "monitoring"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {incident.status === "resolved"
                          ? "Resolvido"
                          : incident.status === "monitoring"
                            ? "Monitorando"
                            : incident.status === "identified"
                              ? "Identificado"
                              : "Investigando"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3 text-sm">{incident.description}</p>
                  <div className="text-xs sm:text-sm text-gray-500 mb-3 space-y-1">
                    <p>Início: {incident.startTime.toLocaleString("pt-BR")}</p>
                    {incident.endTime && <p>Fim: {incident.endTime.toLocaleString("pt-BR")}</p>}
                    <p>
                      Serviços afetados:{" "}
                      {incident.affectedServices.map((id) => services.find((s) => s.id === id)?.name).join(", ")}
                    </p>
                  </div>
                  <div className="border-t pt-3">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">Atualizações:</h4>
                    <div className="space-y-2">
                      {incident.updates.map((update, index) => (
                        <div key={index} className="text-xs sm:text-sm">
                          <span className="text-gray-500">{update.time.toLocaleString("pt-BR")}</span>
                          <p className="text-gray-700">{update.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
