"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, Edit, UserPlus } from "lucide-react"
import type { Obra, AsignacionContrato, Empleado } from "@/lib/types/database"
import { createAssignment } from "@/app/actions/projects"
import { useRouter } from "next/navigation"

interface ProjectDetailProps {
  project: Obra
  assignments: (AsignacionContrato & { empleado: Empleado })[]
  employees: Empleado[]
}

export function ProjectDetail({ project, assignments, employees }: ProjectDetailProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCreateAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      empleado_id: formData.get("empleado_id") as string,
      obra_id: project.id,
      fecha_inicio: formData.get("fecha_inicio") as string,
      tipo_contrato: formData.get("tipo_contrato") as string,
      categoria: formData.get("categoria") as string,
      salario: formData.get("salario") as string,
    }

    await createAssignment(data)
    setLoading(false)
    setDialogOpen(false)
    router.refresh()
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "en_curso":
        return "default"
      case "planificada":
        return "secondary"
      case "finalizada":
        return "outline"
      case "suspendida":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{project.nombre}</h1>
            <p className="text-muted-foreground">{project.codigo ? `Code: ${project.codigo}` : "No code"}</p>
          </div>
        </div>
        <Button className="gap-2">
          <Edit className="h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={getStatusColor(project.estado)} className="text-base capitalize">
              {project.estado.replace("_", " ")}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{project.ubicacion || "-"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {project.presupuesto ? `$${Number(project.presupuesto).toLocaleString()}` : "-"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{assignments.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">
                {project.fecha_inicio ? new Date(project.fecha_inicio).toLocaleDateString() : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated End Date</p>
              <p className="font-medium">
                {project.fecha_fin_estimada ? new Date(project.fecha_fin_estimada).toLocaleDateString() : "-"}
              </p>
            </div>
            {project.fecha_fin_real && (
              <div>
                <p className="text-sm text-muted-foreground">Actual End Date</p>
                <p className="font-medium">{new Date(project.fecha_fin_real).toLocaleDateString()}</p>
              </div>
            )}
          </div>
          {project.descripcion && (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{project.descripcion}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Employee Assignments</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Assign Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Employee to Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="empleado_id">Employee *</Label>
                  <Select name="empleado_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.nombre} {emp.apellido} - {emp.dni}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_inicio">Start Date *</Label>
                  <Input id="fecha_inicio" name="fecha_inicio" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_contrato">Contract Type *</Label>
                  <Select name="tipo_contrato" required>
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
                  <Label htmlFor="categoria">Category *</Label>
                  <Select name="categoria" required>
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
                <div className="space-y-2">
                  <Label htmlFor="salario">Salary</Label>
                  <Input id="salario" name="salario" type="number" step="0.01" />
                </div>
                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Assigning..." : "Assign Employee"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {assignments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Contract Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      <Link href={`/employees/${assignment.empleado.id}`} className="hover:underline">
                        {assignment.empleado.nombre} {assignment.empleado.apellido}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{assignment.empleado.dni}</TableCell>
                    <TableCell className="capitalize">{assignment.tipo_contrato.replace("_", " ")}</TableCell>
                    <TableCell className="capitalize">{assignment.categoria?.replace("_", " ") || "-"}</TableCell>
                    <TableCell>{new Date(assignment.fecha_inicio).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={assignment.estado === "activo" ? "default" : "secondary"}>
                        {assignment.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No employees assigned to this project</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
