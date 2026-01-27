"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { endAssignment } from "@/app/actions/projects";
import type { AsignacionContrato, Empleado, Obra } from "@/lib/data/types/database";

interface EndAssignmentFormProps {
  assignment: AsignacionContrato & { empleado: Empleado };
  project: Obra;
  onSuccess: () => void;
  onError: (error: Error) => void;
  onCancel: () => void;
}

export function EndAssignmentForm({
  assignment,
  project,
  onSuccess,
  onError,
  onCancel,
}: EndAssignmentFormProps) {
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await endAssignment({
        assignmentId: assignment.id,
        fechaFin: endDate,
      });
      onSuccess();
    } catch (error) {
      onError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Employee</Label>
        <p className="text-sm text-muted-foreground">
          {assignment.empleado.nombre} {assignment.empleado.apellido}
        </p>
      </div>
      <div className="space-y-2">
        <Label>Project</Label>
        <p className="text-sm text-muted-foreground">{project.nombre}</p>
      </div>
      <div className="space-y-2">
        <Label>Start Date</Label>
        <p className="text-sm text-muted-foreground">
          {new Date(assignment.fechaInicio).toLocaleDateString()}
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="endDate">End Date *</Label>
        <Input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Ending..." : "End Assignment"}
        </Button>
      </div>
    </form>
  );
}
