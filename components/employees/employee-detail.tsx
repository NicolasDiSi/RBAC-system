"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { ArrowLeft, Edit, FileText, History, Briefcase, UserX } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DeactivateEmployeeForm } from "./deactivate-employee-form"
import { toast } from "sonner"
import { type InferSelectModel } from 'drizzle-orm'
import { empleados, asignacionesContratos, documentos, historialRelacionLaboral } from '@/lib/db/schema'

type Employee = InferSelectModel<typeof empleados>;
type Document = InferSelectModel<typeof documentos>;
type HistoryEvent = InferSelectModel<typeof historialRelacionLaboral> & {
  obra: { nombre: string } | null
};
type Assignment = InferSelectModel<typeof asignacionesContratos> & {
  obra: { nombre: string }
};

interface EmployeeDetailProps {
  employee: Employee
  assignments: Assignment[]
  documents: Document[]
  history: HistoryEvent[]
  permissions: {
    canUpdate: boolean
    canDeactivate: boolean
  }
}

export function EmployeeDetail({ employee, assignments, documents, history, permissions }: EmployeeDetailProps) {
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)

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
        <div className="flex gap-2">
          {permissions.canUpdate && (
            <Link href={`/employees/${employee.id}/edit`} passHref>
              <Button className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          )}
          {permissions.canDeactivate && employee.estado === "activo" && (
            <Button variant="destructive" className="gap-2" onClick={() => setDeactivateDialogOpen(true)}>
              <UserX className="h-4 w-4" />
              Deactivate
            </Button>
          )}
        </div>
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
            <p className="text-lg font-semibold capitalize">{employee.tipoContrato?.replace("_", " ") || "-"}</p>
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
                    {employee.fechaNacimiento ? new Date(employee.fechaNacimiento).toLocaleDateString() : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{new Date(employee.fechaIngreso).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">
                    {employee.fechaEgreso ? new Date(employee.fechaEgreso).toLocaleDateString() : "-"}
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
                        <TableCell>{new Date(assignment.fechaInicio).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {assignment.fechaFin ? new Date(assignment.fechaFin).toLocaleDateString() : "Ongoing"}
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
                        <TableCell className="font-medium capitalize">{doc.tipoDocumento.replace("_", " ")}</TableCell>
                        <TableCell>{doc.nombreArchivo}</TableCell>
                        <TableCell>{doc.fechaSubida ? new Date(doc.fechaSubida).toLocaleDateString() : "-"}</TableCell>
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
                          <p className="font-medium capitalize">{event.tipoEvento.replace("_", " ")}</p>
                          <p className="text-sm text-muted-foreground">{event.descripcion}</p>
                          {event.obra && (
                            <p className="text-sm text-muted-foreground mt-1">Project: {event.obra.nombre}</p>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.fechaEvento).toLocaleDateString()}
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
      <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <DialogContent>
          <DialogDescription>
            Are you sure you want to deactivate {employee.nombre} {employee.apellido}?
          </DialogDescription>
          <DialogHeader>
            <DialogTitle>Deactivate Employee</DialogTitle>
            <DialogDescription>
              Set the end date for the employment of {employee.nombre} {employee.apellido}.
            </DialogDescription>
          </DialogHeader>
          <DeactivateEmployeeForm
            employee={employee}
            onSuccess={() => {
              toast.success("Employee deactivated successfully!");
              setDeactivateDialogOpen(false);
            }}
            onError={(error) => {
              toast.error(error.message || "Failed to deactivate employee.");
            }}
            onCancel={() => setDeactivateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
