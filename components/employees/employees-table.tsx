"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { Eye, Edit, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { type InferSelectModel } from 'drizzle-orm'
import { empleados } from '@/lib/db/schema'

type Employee = InferSelectModel<typeof empleados>;
export function EmployeesTable({ employees }: { employees: Employee[] }) {
  const [search, setSearch] = useState("")

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.nombre.toLowerCase().includes(search.toLowerCase()) ||
      emp.apellido.toLowerCase().includes(search.toLowerCase()) ||
      emp.dni.includes(search),
  )

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "activo":
        return "default"
      case "inactivo":
        return "secondary"
      case "suspendido":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by name or DNI..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <span className="text-sm text-muted-foreground">{filteredEmployees.length} employees</span>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Contract Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">
                  {employee.nombre} {employee.apellido}
                </TableCell>
                <TableCell className="text-muted-foreground">{employee.dni}</TableCell>
                <TableCell>
                  <span className="capitalize">{employee.tipoContrato?.replace("_", " ") || "-"}</span>
                </TableCell>
                <TableCell>
                  <span className="capitalize">{employee.categoria?.replace("_", " ") || "-"}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(employee.estado)}>{employee.estado}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(employee.fechaIngreso).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {employee.fechaEgreso ? new Date(employee.fechaEgreso).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <Link href={`/employees/${employee.id}`} passHref>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                      </Link>
                      <Link href={`/employees/${employee.id}/edit`} passHref>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
