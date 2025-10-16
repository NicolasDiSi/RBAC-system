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
import { createEmployee } from "@/app/actions/employees"

export function EmployeeForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      nombre: formData.get("nombre") as string,
      apellido: formData.get("apellido") as string,
      dni: formData.get("dni") as string,
      fecha_nacimiento: formData.get("fecha_nacimiento") as string,
      telefono: formData.get("telefono") as string,
      email: formData.get("email") as string,
      direccion: formData.get("direccion") as string,
      fecha_ingreso: formData.get("fecha_ingreso") as string,
      tipo_contrato: formData.get("tipo_contrato") as string,
      categoria: formData.get("categoria") as string,
      observaciones: formData.get("observaciones") as string,
    }

    await createEmployee(data)
    router.push("/employees")
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">First Name *</Label>
              <Input id="nombre" name="nombre" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Last Name *</Label>
              <Input id="apellido" name="apellido" required />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dni">DNI *</Label>
              <Input id="dni" name="dni" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Date of Birth</Label>
              <Input id="fecha_nacimiento" name="fecha_nacimiento" type="date" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telefono">Phone</Label>
              <Input id="telefono" name="telefono" type="tel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Address</Label>
            <Input id="direccion" name="direccion" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="fecha_ingreso">Start Date *</Label>
              <Input id="fecha_ingreso" name="fecha_ingreso" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo_contrato">Contract Type</Label>
              <Select name="tipo_contrato">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planta_permanente">Planta Permanente</SelectItem>
                  <SelectItem value="contratado">Contratado</SelectItem>
                  <SelectItem value="eventual">Eventual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Category</Label>
              <Select name="categoria">
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oficial">Oficial</SelectItem>
                  <SelectItem value="medio_oficial">Medio Oficial</SelectItem>
                  <SelectItem value="ayudante">Ayudante</SelectItem>
                  <SelectItem value="peon">Peón</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Notes</Label>
            <Textarea id="observaciones" name="observaciones" rows={3} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Employee"}
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
