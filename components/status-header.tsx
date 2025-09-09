"use client"
import { CheckCircle, AlertCircle, Clock } from "lucide-react"

interface StatusHeaderProps {
  overallStatus: "operational" | "degraded" | "down"
}

export function StatusHeader({ overallStatus }: StatusHeaderProps) {
  const getStatusIcon = () => {
    switch (overallStatus) {
      case "operational":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "degraded":
        return <Clock className="h-6 w-6 text-yellow-500" />
      case "down":
        return <AlertCircle className="h-6 w-6 text-red-500" />
    }
  }

  const getStatusText = () => {
    switch (overallStatus) {
      case "operational":
        return "Todos os sistemas operacionais"
      case "degraded":
        return "Alguns sistemas com problemas"
      case "down":
        return "Sistemas com falhas"
    }
  }

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">BlueHosting Status</h1>
              <p className="text-primary-foreground/80">Monitor de status dos serviços</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">{getStatusText()}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
