"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { Eye } from "lucide-react"
import { type InferSelectModel } from 'drizzle-orm'
import { obras } from '@/lib/db/schema'

type Project = InferSelectModel<typeof obras>;
interface ProjectWithCount extends Project {
  asignaciones_contratos: { count: number }[]
}

export function ProjectsTable({ projects }: { projects: ProjectWithCount[] }) {
  const [search, setSearch] = useState("")

  const filteredProjects = projects.filter(
    (project) =>
      project.nombre.toLowerCase().includes(search.toLowerCase()) ||
      project.codigo?.toLowerCase().includes(search.toLowerCase()),
  )

  const getStatusColor = (estado: string | null) => {
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
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <span className="text-sm text-muted-foreground">{filteredProjects.length} projects</span>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.nombre}</TableCell>
                <TableCell className="text-muted-foreground">{project.codigo || "-"}</TableCell>
                <TableCell className="text-muted-foreground">{project.ubicacion || "-"}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(project.estado)} className="capitalize">
                    {project?.estado?.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {project.fechaInicio || "-"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{project.asignaciones_contratos[0]?.count || 0}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
