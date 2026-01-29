"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useState } from "react"
import { Download, Eye, AlertCircle } from "lucide-react"
import { InferSelectModel } from "drizzle-orm"
import { documentos } from "@/lib/db/schema"

interface DocumentWithEmployee extends InferSelectModel<typeof documentos> {
  empleado: { nombre: string; apellido: string; dni: string } | null
}


export function DocumentsTable({ documents }: { documents: DocumentWithEmployee[] }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.empleado?.nombre.toLowerCase().includes(search.toLowerCase()) ||
      doc.empleado?.apellido.toLowerCase().includes(search.toLowerCase()) ||
      doc.empleado?.dni.includes(search) ||
      doc.tipoDocumento.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === "all" || doc.estado === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (estado: string | null) => {
    switch (estado) {
      case "vigente":
        return "default"
      case "por_vencer":
        return "secondary"
      case "vencido":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const isExpiringSoon = (fecha_vencimiento: string | null) => {
    if (!fecha_vencimiento) return false
    const daysUntilExpiry = Math.floor(
      (new Date(fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    )
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by employee or document type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="vigente">Vigente</SelectItem>
            <SelectItem value="por_vencer">Por Vencer</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filteredDocuments.length} documents</span>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>File Name</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  {doc.empleado ? (
                    <Link href={`/employees/${doc.empleadoId}`} className="hover:underline">
                      {doc.empleado.nombre} {doc.empleado.apellido}
                    </Link>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="capitalize">{doc.tipoDocumento.replace("_", " ")}</TableCell>
                <TableCell className="text-muted-foreground">{doc.nombreArchivo}</TableCell>
                <TableCell className="text-muted-foreground">
                  {doc.fechaSubida ? new Date(doc.fechaSubida).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell>
                  {doc.fechaVencimiento ? (
                    <div className="flex items-center gap-2">
                      {isExpiringSoon(doc.fechaVencimiento) && <AlertCircle className="h-4 w-4 text-orange-600" />}
                      <span className={isExpiringSoon(doc.fechaVencimiento) ? "text-orange-600" : ""}>
                        {new Date(doc.fechaVencimiento).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(doc.estado)}>{doc.estado}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
