'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { uploadDocument, listDocumentFolders, createDocumentFolder } from "@/app/actions/documents"
import { type InferSelectModel } from 'drizzle-orm'
import { empleados } from '@/lib/db/schema'

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

const formSchema = z.object({
  empleadoId: z.string(),
  tipoDocumento: z.string(),
  file: z.any()
    .refine((files) => files?.length == 1, "File is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
    .refine(
      (files) => ACCEPTED_MIME_TYPES.includes(files?.[0]?.type),
      "Accepted file types are: .pdf, .doc, .docx, .jpg, .jpeg, .png"
    ),
  fechaVencimiento: z.string().optional(),
  observaciones: z.string().optional(),
  folder: z.string().optional(),
})

type Employee = InferSelectModel<typeof empleados>;
export function DocumentUploadForm({ employees }: { employees: Employee[] }) {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      empleadoId: '',
      tipoDocumento: '',
      fechaVencimiento: '',
      observaciones: '',
    },
  })

  const { isSubmitting } = form.formState
  const [folders, setFolders] = useState<string[]>([])
  const [newFolderName, setNewFolderName] = useState("")

  // load existing folders on mount
  useEffect(() => {
    async function load() {
      try {
        const items = await listDocumentFolders()
        // extract folder names relative to documents/
        const names = items
          .filter((i: any) => i.type === "folder")
          .map((i: any) => {
            let key: string = i.key as string
            key = key.replace(/^documents\//, "")
            return key.replace(/\/$/, "")
          })
        setFolders(names)
      } catch (err) {
        console.error("failed to load folders", err)
      }
    }
    load()
  }, [])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = new FormData()
    formData.append('empleadoId', values.empleadoId)
    formData.append('tipoDocumento', values.tipoDocumento)
    formData.append('file', values.file[0])
    if (values.fechaVencimiento) {
      formData.append('fechaVencimiento', values.fechaVencimiento)
    }
    if (values.observaciones) {
      formData.append('observaciones', values.observaciones)
    }
    if (values.folder) {
      formData.append('folder', values.folder)
    }

    try {
      await uploadDocument(formData)
      toast.success('Document uploaded successfully!')
      router.push('/documents')
    } catch (error) {
      toast.error('Failed to upload document.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="empleadoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.nombre} {emp.apellido} - {emp.dni}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipoDocumento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File *</FormLabel>
                  <FormControl>
                    <Input type="file" onChange={(e) => field.onChange(e.target.files)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fechaVencimiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="folder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder</FormLabel>
                  <div className="flex items-center gap-2">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select or type folder" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">(root)</SelectItem>
                        {folders.map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      size="sm"
                      onClick={async () => {
                        if (!newFolderName) return
                        try {
                          await createDocumentFolder(`documents/${newFolderName}`)
                          setFolders((prev) => [...prev, newFolderName])
                          field.onChange(newFolderName)
                          setNewFolderName("")
                        } catch (err) {
                          console.error("could not create folder", err)
                        }
                      }}
                    >
                      New
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* input for new folder name to the side */}
            <div className="flex gap-2 items-center">
              <Input
                placeholder="New folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Uploading..." : "Upload Document"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
