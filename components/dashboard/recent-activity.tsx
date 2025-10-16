"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { HistorialRelacionLaboral } from "@/lib/types/database"

interface RecentActivityProps {
  history: (HistorialRelacionLaboral & {
    empleado: { nombre: string; apellido: string } | null
  })[]
}

export function RecentActivity({ history }: RecentActivityProps) {
  const getEventColor = (tipo: string) => {
    switch (tipo) {
      case "ingreso":
        return "default"
      case "cambio_categoria":
        return "secondary"
      case "cambio_obra":
        return "outline"
      case "suspension":
        return "destructive"
      case "egreso":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((event) => (
              <div key={event.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={getEventColor(event.tipo_evento)} className="capitalize">
                      {event.tipo_evento.replace("_", " ")}
                    </Badge>
                    {event.empleado && (
                      <span className="font-medium">
                        {event.empleado.nombre} {event.empleado.apellido}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{event.descripcion}</p>
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(event.fecha_evento).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No recent activity</p>
        )}
      </CardContent>
    </Card>
  )
}
