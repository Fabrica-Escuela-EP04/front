import { useState } from "react";
import { useMedicalInfo } from "@/hooks/useMedicalInfo";
import { useCreateMedOffice } from "@/hooks/useCreateMedOffice";
import { MedicalOffice } from "@/models/MedicalOffice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building2, ChevronDown } from "lucide-react";

const clinicSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty({ message: "El nombre del consultorio es requerido" })
    .max(100, { message: "El nombre debe tener menos de 100 caracteres" }),
  type: z
    .string()
    .nonempty({ message: "Seleccione un tipo de consultorio" }),
  sede: z
    .string()
    .nonempty({ message: "Seleccione una sede" }),
  status: z
    .string()
    .nonempty({ message: "Seleccione un estado técnico" }),
});

type ClinicFormData = z.infer<typeof clinicSchema>;

interface ClinicRegistrationFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export function ClinicRegistrationForm({onCancel, onSuccess }: ClinicRegistrationFormProps) {
  const { handleCreateMedicalOffice } = useCreateMedOffice();
  const { medicalInfo, isLoading, error } = useMedicalInfo();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    mode: "onChange",
  });

  const watchedValues = watch();

  const onSubmit = async (data: ClinicFormData) => {
      const newOffice:MedicalOffice = {
        "clinicName": data.sede,
        "officeNumber": parseInt(data.name),
        "specialtyName": data.type,
        "status": data.status
      }
      const { createdOffice } = await handleCreateMedicalOffice(newOffice);
      console.log(createdOffice.officeNumber);
      onSuccess();
  };

  return (
        <div className="flex-1 bg-medical-light-gray p-8">
          <Card className="max-w-2xl mx-auto shadow-lg">
            <CardHeader className="text-center border-b border-medical-border">
              <CardTitle className="text-xl font-semibold text-medical-dark">
                NUEVO CONSULTORIO
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label 
                      htmlFor="name" 
                      className="text-sm font-medium text-medical-dark"
                    >
                      Número de consultorio
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Ingrese el número del consultorio"
                      className={`transition-colors ${
                        errors.name 
                          ? "border-destructive focus:border-destructive" 
                          : "border-medical-border focus:border-medical-primary"
                      }`}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      aria-invalid={!!errors.name}
                      {...register("name")}
                    />
                    {errors.name && (
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription id="name-error" className="text-sm">
                          {errors.name.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium text-medical-dark">
                      Tipo
                    </Label>
                    <Select
                      onValueChange={(value) => setValue("type", value, { shouldValidate: true })}
                      value={watchedValues.type || ""}
                    >
                      <SelectTrigger 
                        className={`transition-colors ${
                          errors.type 
                            ? "border-destructive focus:border-destructive" 
                            : "border-medical-border focus:border-medical-primary"
                        }`}
                        aria-describedby={errors.type ? "type-error" : undefined}
                        aria-invalid={!!errors.type}
                      >
                        <SelectValue placeholder="Seleccione un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {
                        medicalInfo?.specialties?.map(specialty => (
                          <SelectItem value={specialty.specialtyName}>
                            {specialty.specialtyName}
                          </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription id="type-error" className="text-sm">
                          {errors.type.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sede" className="text-sm font-medium text-medical-dark">
                      Sede
                    </Label>
                    <Select
                      onValueChange={(value) => setValue("sede", value, { shouldValidate: true })}
                      value={watchedValues.sede || ""}
                    >
                      <SelectTrigger 
                        className={`transition-colors ${
                          errors.sede 
                            ? "border-destructive focus:border-destructive" 
                            : "border-medical-border focus:border-medical-primary"
                        }`}
                        aria-describedby={errors.sede ? "sede-error" : undefined}
                        aria-invalid={!!errors.sede}
                      >
                        <SelectValue placeholder="Seleccione una sede" />
                      </SelectTrigger>
                      <SelectContent>
                        {
                          medicalInfo?.clinics?.map(clinic => (
                            <SelectItem value={clinic.name}>
                              {clinic.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    {errors.sede && (
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription id="sede-error" className="text-sm">
                          {errors.sede.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium text-medical-dark">
                      Estado Técnico
                    </Label>
                    <Select
                      onValueChange={(value) => setValue("status", value, { shouldValidate: true })}
                      value={watchedValues.status || ""}
                    >
                      <SelectTrigger 
                        className={`transition-colors ${
                          errors.status 
                            ? "border-destructive focus:border-destructive" 
                            : "border-medical-border focus:border-medical-primary"
                        }`}
                        aria-describedby={errors.status ? "status-error" : undefined}
                        aria-invalid={!!errors.status}
                      >
                        <SelectValue placeholder="Seleccione un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                        <SelectItem value="Mantenimiento">En mantenimiento</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription id="status-error" className="text-sm">
                          {errors.status.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="medical-outline"
                    className="flex-1 h-11 text-base font-medium"
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="medical"
                    className="flex-1 h-11 text-base font-medium"
                    disabled={!isDirty || !isValid || isLoading}
                    aria-describedby="save-status"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar"
                    )}
                  </Button>
                </div>

                <div id="save-status" className="sr-only" aria-live="polite">
                  {isLoading && "Guardando información del consultorio"}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
  );
}