"use client";

import { useEffect, type FC } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createEmployee, updateEmployee } from "@/app/actions/employees";
import {
	createEmployeeSchema,
	editEmployeeSchema,
	CreateEmployeeFormValues,
	EditEmployeeFormValues,
} from "@/lib/validations/employee-schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Empleado } from "@/lib/data/types/database";

type EmployeeFormValues = CreateEmployeeFormValues | EditEmployeeFormValues;

interface EmployeeFormProps {
	employee?: Empleado | null;
}

export const EmployeeForm: FC<EmployeeFormProps> = ({ employee }) => {
	const router = useRouter();
	const isEditing = !!employee;
	const formSchema = isEditing ? editEmployeeSchema : createEmployeeSchema;

	const form = useForm<EmployeeFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			nombre: "",
			apellido: "",
			dni: "",
			fechaNacimiento: "",
			telefono: "",
			email: "",
			direccion: "",
			fechaIngreso: "",
			fechaEgreso: "",
			tipoContrato: "",
			categoria: "",
			observaciones: "",
		},
	});

	useEffect(() => {
		if (employee) {
			form.reset(employee);
		}
	}, [employee, form]);

	const { isSubmitting } = form.formState;

	const onSubmit = async (values: EmployeeFormValues) => {
		try {
			if (isEditing && employee) {
				await updateEmployee(employee.id, values as EditEmployeeFormValues);
				toast.success("Employee updated successfully!");
				router.push("/employees");
			} else {
				await createEmployee(values as CreateEmployeeFormValues);
				toast.success("Employee created successfully!");
				router.push("/employees");
			}
		} catch (error) {
			toast.error("Failed to save employee.");
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>Employee Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="nombre"
								render={({ field }) => (
									<FormItem>
										<FormLabel>First Name *</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="apellido"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Last Name *</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="dni"
								render={({ field }) => (
									<FormItem>
										<FormLabel>DNI *</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="fecha_nacimiento"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Date of Birth</FormLabel>
										<FormControl>
											<Input type="date" {...field} value={field.value ?? ''} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="telefono"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Phone</FormLabel>
										<FormControl>
											<Input type="tel" {...field} value={field.value ?? ''} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input type="email" {...field} value={field.value ?? ''} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="direccion"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Address</FormLabel>
									<FormControl>
										<Input {...field} value={field.value ?? ''} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid gap-4 md:grid-cols-3">
							<FormField
								control={form.control}
								name="fechaIngreso"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Start Date *</FormLabel>
										<FormControl>
											<Input type="date" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="fechaEgreso"
								render={({ field }) => (
									<FormItem>
										<FormLabel>End Date</FormLabel>
										<FormControl>
											<Input type="date" {...field} value={field.value ?? ''} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="tipoContrato"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contract Type</FormLabel>
										<FormControl>
											<Select onValueChange={field.onChange} value={field.value ?? ''}>
												<SelectTrigger>
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="planta_permanente">Planta Permanente</SelectItem>
													<SelectItem value="contratado">Contratado</SelectItem>
													<SelectItem value="eventual">Eventual</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="categoria"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Category *</FormLabel>
									<FormControl>
										<Select onValueChange={field.onChange} value={field.value ?? ''}>
											<SelectTrigger>
												<SelectValue placeholder={`Select category`} />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="oficial">Oficial</SelectItem>
												<SelectItem value="medio_oficial">Medio Oficial</SelectItem>
												<SelectItem value="ayudante">Ayudante</SelectItem>
												<SelectItem value="peon">Peón</SelectItem>
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="observaciones"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notes</FormLabel>
									<FormControl>
										<Textarea rows={3} {...field} value={field.value ?? ''} />
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
									: "Create Employee"}
							</Button>
						</div>
					</CardContent>
				</Card>
			</form>
		</Form>
	);
};
