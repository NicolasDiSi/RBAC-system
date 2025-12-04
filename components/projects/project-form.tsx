"use client";

import { useEffect, type FC } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createProject, updateProject } from "@/app/actions/projects";
import {
  createProjectSchema,
  editProjectSchema,
  CreateProjectFormValues,
  EditProjectFormValues,
} from "@/lib/validations/project-schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Obra } from "@/lib/data/types/database";

type ProjectFormValues = CreateProjectFormValues | EditProjectFormValues;

interface ProjectFormProps {
  project?: Obra | null;
}

export const ProjectForm: FC<ProjectFormProps> = ({ project }) => {
  const router = useRouter();
  const isEditing = !!project;
  const formSchema = isEditing ? editProjectSchema : createProjectSchema;

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      codigo: "",
      ubicacion: "",
      fecha_inicio: "",
      fecha_fin_estimada: "",
      presupuesto: 0,
      descripcion: "",
      estado: "planificada",
    },
  });

  useEffect(() => {
    if (project) {
      form.reset(project);
    }
  }, [project, form]);

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      if (isEditing && project) {
        await updateProject(project.id, values as EditProjectFormValues);
        toast.success("Project updated successfully!");
        router.push("/projects");
      } else {
        await createProject(values as CreateProjectFormValues);
        toast.success("Project created successfully!");
        router.push("/projects");
      }
    } catch (error) {
      toast.error("Failed to save project.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ubicacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="fecha_inicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fecha_fin_estimada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="presupuesto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="planificada">Planificada</SelectItem>
                      <SelectItem value="en_curso">En Curso</SelectItem>
                      <SelectItem value="finalizada">Finalizada</SelectItem>
                      <SelectItem value="suspendida">Suspendida</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditing
                    ? "Saving..."
                    : "Creating..."
                  : isEditing
                  ? "Save Changes"
                  : "Create Project"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};
