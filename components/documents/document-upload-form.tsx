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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, AlertCircle } from "lucide-react"
import { uploadDocument } from "@/app/actions/documents"
import type { Empleado } from "@/lib/types/database"

export function DocumentUploadForm({ employees }: { employees: Empleado[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB")
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append("file", file)

      await uploadDocument(formData)
      router.push("/documents")
    } catch (err: any) {
      setError(err.message || "Failed to upload document")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Document Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
            <Label htmlFor="tipo_documento">Document Type *</Label>
            <Select name="tipo_documento" required>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dni">DNI</SelectItem>
                <SelectItem value="contrato">Contrato</SelectItem>
                <SelectItem value="certificado">Certificado</SelectItem>
                <SelectItem value="licencia">Licencia</SelectItem>
                <SelectItem value="titulo">Título</SelectItem>
                <SelectItem value="examen_medico">Examen Médico</SelectItem>
                <SelectItem value="seguro">Seguro</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File *</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                required
                className="cursor-pointer"
              />
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  {file.name}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_vencimiento">Expiration Date</Label>
            <Input id="fecha_vencimiento" name="fecha_vencimiento" type="date" />
            <p className="text-xs text-muted-foreground">Leave empty if document does not expire</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Notes</Label>
            <Textarea id="observaciones" name="observaciones" rows={3} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading || !file}>
              {loading ? "Uploading..." : "Upload Document"}
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
