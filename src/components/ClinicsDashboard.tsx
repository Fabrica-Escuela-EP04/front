import { useState, useEffect } from "react";
import { MedicalOfficeAndSchedule } from "@/models/MedicalOfficeAndSchedule";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClinicEditDialog } from "@/components/ClinicEditDialog";
import { DeleteClinicDialog } from "@/components/DeleteClinicDialog";
import { toast } from "@/hooks/use-toast";
import { useUpdateMedOffice } from "@/hooks/useUpdateMedOffice";
import { useDeleteMedOffice } from "@/hooks/useDeleteMedOffice";
import { MedicalInformation } from "@/models/MedicalInformation";

interface ClinicsDashboardProps {
  onNewClinic: () => void;
  medicalInfo: MedicalInformation;
  medOfficesAndSchedules: MedicalOfficeAndSchedule[]
}

export function ClinicsDashboard({ onNewClinic, medicalInfo, medOfficesAndSchedules }: ClinicsDashboardProps) {
  const [selectedSede, setSelectedSede] = useState<string>("todas");
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string>("todas");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [editingMedicalOffice, setEditingMedicalOffice] = useState<MedicalOfficeAndSchedule | null>(null);
  const [deletingClinic, setDeletingOffice] = useState<MedicalOfficeAndSchedule | null>(null);

  const [medOfficesSchedules, setMedOffices] = useState<MedicalOfficeAndSchedule[]>(medOfficesAndSchedules);
  const { handleUpdateMedOffice } = useUpdateMedOffice();
  const { handleDeleteMedicalOffice } = useDeleteMedOffice();
  
  useEffect(() => {
    if (medOfficesSchedules?.length) {
      setMedOffices(medOfficesSchedules);
    }
  }, [medOfficesSchedules]);

  const getFilteredOffices = () => {
    
    return medOfficesSchedules.filter(medOffice => {
      const matchesSede = selectedSede === "todas" || medOffice.clinicName === selectedSede;
      const matchesEspecialidad = selectedEspecialidad === "todas" || medOffice.specialtyName === selectedEspecialidad;
       const matchesEstado = selectedEstado === "todos" || medOffice.status === selectedEstado;
      return matchesSede && matchesEspecialidad && matchesEstado;
    });
  };

  const handleUpdateOffice = async (updatedOffice: MedicalOfficeAndSchedule) => {
    const upOffice = await handleUpdateMedOffice(updatedOffice);
    let toastMessage:string;
    let toastTitle:string;
    console.log(typeof upOffice);
    console.log(upOffice !== null);
    console.log("detail" in upOffice);

    if (typeof upOffice === "object" && upOffice !== null && "idOffice" in upOffice){
      setMedOffices(medOfficesSchedules.map(c => c.idOffice === updatedOffice.idOffice ? updatedOffice : c));
      toastMessage = "Consultorio actualizado correctamente. La nueva información se puede visualizar en el dashboard";
      toastTitle = "Consultorio actualizado";
    } else {
      toastMessage = "Error al actualizar consultorio, por favor intente nuevamente.";
      toastTitle = "Error";
    }
    setEditingMedicalOffice(null);
    toast({
      title: toastTitle,
      description: toastMessage,
    });
  };

  const handleDeleteMedOffice = async (idOffice: number) => {
    const deletedOffice = await handleDeleteMedicalOffice(idOffice);
    let toastMessage:string;
    let toastTitle:string;
    console.log(typeof deletedOffice);
    console.log("clinicName" in deletedOffice);
    // handling errors
    if ( typeof deletedOffice === "object" && deletedOffice !== null && "clinicName" in deletedOffice){
      deletingClinic.status = deletedOffice.status;
      setDeletingOffice(deletingClinic);
      setMedOffices(medOfficesSchedules.map(c => c.idOffice === idOffice ? deletingClinic : c));
      toastTitle = "Consultorio eliminado"
      toastMessage = "El consultorio ha sido eliminado exitosamente, se mostrará con estado inactivo en el dashboard";
    } else {
        toastMessage = "Error al eliminar el consultorio, intente nuevamente";
        toastTitle = "Error"
    }
    setDeletingOffice(null);
    toast({
      title: toastTitle,
      description: toastMessage,
      variant: "destructive",
    });
  };

  const getStatusDisplay = (medicalOffice: MedicalOfficeAndSchedule) => {
    if (medicalOffice.status === "Mantenimiento" && medicalOffice.startDate && medicalOffice.endDate) {
      return `Mantenimiento: ${medicalOffice.startDate} - ${medicalOffice.endDate}`;
    }
    return medicalOffice.status;
  };

  const filteredOffices = getFilteredOffices();

  return (
    <div className="flex-1 bg-medical-light-gray">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Filter Bar */}
        <div className="mb-6 flex items-center gap-4">

            <Select value={selectedSede} onValueChange={setSelectedSede}>
              <SelectTrigger className="w-[200px] bg-medical-light-gray border-medical-border">
                <SelectValue placeholder="Sede" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-medical-border z-50">
                <SelectItem value="todas">Todas las sedes</SelectItem>
                {
                  medicalInfo?.clinics?.map(clinic => (
                    <SelectItem value={clinic.name}>
                      {clinic.name}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>

            <Select value={selectedEspecialidad} onValueChange={setSelectedEspecialidad}>
              <SelectTrigger className="w-[200px] bg-medical-light-gray border-medical-border">
                <SelectValue placeholder="Especialidad" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-medical-border z-50">
                <SelectItem value="todas">Todas las especialidades</SelectItem>
                {
                  medicalInfo?.specialties?.map(specialty => (
                    <SelectItem value={specialty.specialtyName}>
                      {specialty.specialtyName}
                    </SelectItem>
                    ))
                }
              </SelectContent>
            </Select>

            <Select value={selectedEstado} onValueChange={setSelectedEstado}>
              <SelectTrigger className="w-[200px] bg-medical-light-gray border-medical-border">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-medical-border z-50">
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
                <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
              </SelectContent>
          </Select>
          
          <div className="flex-1" />
          <Button
            onClick={onNewClinic}
            variant="secondary"
            className="gap-2"
          >
            Nuevo Consultorio <Plus className="h-4 w-4" />
          </Button>
          
        </div>

        {/* Medical Offices List */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            {filteredOffices.length === 0 ? (
              <div className="text-center py-12 text-medical-gray">
                <p className="text-lg font-medium">No se encontraron consultorios</p>
                <p className="text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
            <div className="space-y-4">
              {filteredOffices.map((medicalOffice) => (
                <div
                  key={medicalOffice.idOffice}
                  className="flex items-start justify-between border-b border-medical-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-medical-dark mb-1">Consultorio {medicalOffice.officeNumber}</h3>
                    <p className="text-sm text-medical-gray">
                      {medicalOffice.specialtyName}, {medicalOffice.clinicName},
                    </p>
                    <p className="text-sm text-medical-gray">{getStatusDisplay(medicalOffice)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingMedicalOffice(medicalOffice)}
                    >
                      Modificar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeletingOffice(medicalOffice)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      {editingMedicalOffice && (
        <ClinicEditDialog
          medicalOffice={editingMedicalOffice}
          open={!!editingMedicalOffice}
          medicalInfo={medicalInfo}
          onOpenChange={(open) => !open && setEditingMedicalOffice(null)}
          onSave={handleUpdateOffice}
        />
      )}

      {/* Delete Dialog */}
      {deletingClinic && (
        <DeleteClinicDialog
          medicalOffice={deletingClinic}
          open={!!deletingClinic}
          onOpenChange={(open) => !open && setDeletingOffice(null)}
          onConfirm={() => handleDeleteMedOffice(deletingClinic.idOffice)}
        />
      )}
    </div>
  );
}