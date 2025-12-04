"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { ArrowLeft, Edit, FileText, History, Briefcase } from "lucide-react"
import type { Empleado, AsignacionContrato, Documento, HistorialRelacionLaboral } from "@/lib/data/types/database"

interface EmployeeDetailProps {
  employee: Empleado
  assignments: (AsignacionContrato & { obra: { nombre: string } })[]
  documents: Documento[]
  history: (HistorialRelacionLaboral & { obra: { nombre: string } | null })[]
}

export function EmployeeDetail({ employee, assignments, documents, history }: EmployeeDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/employees">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {employee.nombre} {employee.apellido}
            </h1>
            <p className="text-muted-foreground">DNI: {employee.dni}</p>
          </div>
        </div>
        <Link href={`/employees/${employee.id}/edit`} passHref>
          <Button className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={employee.estado === "activo" ? "default" : "secondary"} className="text-base">
              {employee.estado}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Contract Type</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold capitalize">{employee.tipo_contrato?.replace("_", " ") || "-"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Category</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold capitalize">{employee.categoria?.replace("_", " ") || "-"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Personal Information</TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {employee.fecha_nacimiento ? new Date(employee.fecha_nacimiento).toLocaleDateString() : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{new Date(employee.fecha_ingreso).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">
                    {employee.fecha_egreso ? new Date(employee.fecha_egreso).toLocaleDateString() : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{employee.telefono || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{employee.email || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{employee.direccion || "-"}</p>
                </div>
                {employee.observaciones && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-medium">{employee.observaciones}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Project Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {assignments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{assignment.obra.nombre}</TableCell>
                        <TableCell>{new Date(assignment.fecha_inicio).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {assignment.fecha_fin ? new Date(assignment.fecha_fin).toLocaleDateString() : "Ongoing"}
                        </TableCell>
                        <TableCell className="capitalize">{assignment.categoria?.replace("_", " ") || "-"}</TableCell>
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
                <p className="text-center text-muted-foreground py-8">No assignments found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Type</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium capitalize">{doc.tipo_documento.replace("_", " ")}</TableCell>
                        <TableCell>{doc.nombre_archivo}</TableCell>
                        <TableCell>{new Date(doc.fecha_subida).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={doc.estado === "vigente" ? "default" : "secondary"}>{doc.estado}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No documents found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Employment History</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((event) => (
                    <div key={event.id} className="border-l-2 border-primary pl-4 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium capitalize">{event.tipo_evento.replace("_", " ")}</p>
                          <p className="text-sm text-muted-foreground">{event.descripcion}</p>
                          {event.obra && (
                            <p className="text-sm text-muted-foreground mt-1">Project: {event.obra.nombre}</p>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.fecha_evento).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No history records found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
