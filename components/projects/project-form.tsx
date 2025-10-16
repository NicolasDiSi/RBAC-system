"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createProject } from "@/app/actions/projects"

export function ProjectForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      nombre: formData.get("nombre") as string,
      codigo: formData.get("codigo") as string,
      ubicacion: formData.get("ubicacion") as string,
      fecha_inicio: formData.get("fecha_inicio") as string,
      fecha_fin_estimada: formData.get("fecha_fin_estimada") as string,
      presupuesto: formData.get("presupuesto") as string,
      descripcion: formData.get("descripcion") as string,
      estado: formData.get("estado") as string,
    }

    await createProject(data)
    router.push("/projects")
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Project Name *</Label>
              <Input id="nombre" name="nombre" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigo">Project Code</Label>
              <Input id="codigo" name="codigo" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ubicacion">Location</Label>
            <Input id="ubicacion" name="ubicacion" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">Start Date</Label>
              <Input id="fecha_inicio" name="fecha_inicio" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_fin_estimada">Estimated End Date</Label>
              <Input id="fecha_fin_estimada" name="fecha_fin_estimada" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="presupuesto">Budget</Label>
              <Input id="presupuesto" name="presupuesto" type="number" step="0.01" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Status</Label>
            <Select name="estado" defaultValue="planificada">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planificada">Planificada</SelectItem>
                <SelectItem value="en_curso">En Curso</SelectItem>
                <SelectItem value="finalizada">Finalizada</SelectItem>
                <SelectItem value="suspendida">Suspendida</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Description</Label>
            <Textarea id="descripcion" name="descripcion" rows={4} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
