"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface DashboardChartsProps {
  employeesByContract: { tipo_contrato: string | null }[]
  projectsByStatus: { estado: string }[]
}

export function DashboardCharts({ employeesByContract, projectsByStatus }: DashboardChartsProps) {
  // Process employee data
  const contractData = employeesByContract.reduce(
    (acc, emp) => {
      const type = emp.tipo_contrato || "unknown"
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const employeeChartData = Object.entries(contractData).map(([name, value]) => ({
    name: name.replace("_", " ").charAt(0).toUpperCase() + name.replace("_", " ").slice(1),
    value,
  }))

  // Process project data
  const statusData = projectsByStatus.reduce(
    (acc, project) => {
      acc[project.estado] = (acc[project.estado] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const projectChartData = Object.entries(statusData).map(([name, value]) => ({
    name: name.replace("_", " ").charAt(0).toUpperCase() + name.replace("_", " ").slice(1),
    value,
  }))

  const COLORS = ["#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a"]

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Employees by Contract Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employeeChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projects by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {projectChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
