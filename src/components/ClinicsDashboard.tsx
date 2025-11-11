import { useState, useEffect } from "react";
import { MedicalOfficeAndSchedule } from "@/models/MedicalOfficeAndSchedule";
import { Search, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ClinicEditDialog } from "@/components/ClinicEditDialog";
import { DeleteClinicDialog } from "@/components/DeleteClinicDialog";
import { toast } from "@/hooks/use-toast";
import { useFindAllMedOffices } from "@/hooks/useFindAllMedOffices";
import { useUpdateMedOffice } from "@/hooks/useUpdateMedOffice";
import { useDeleteMedOffice } from "@/hooks/useDeleteMedOffice";

interface ClinicsDashboardProps {
  onNewClinic: () => void;
}

export function ClinicsDashboard({ onNewClinic }: ClinicsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMedicalOffice, setEditingMedicalOffice] = useState<MedicalOfficeAndSchedule | null>(null);
  const [deletingClinic, setDeletingOffice] = useState<MedicalOfficeAndSchedule | null>(null);
  const [medOfficesSchedules, setMedOffices] = useState<MedicalOfficeAndSchedule[]>([]);
  const { medOfficesAndSchedules } = useFindAllMedOffices();
  const { handleUpdateMedOffice } = useUpdateMedOffice();
  const { handleDeleteMedicalOffice } = useDeleteMedOffice();
  
  useEffect(() => {
    if (medOfficesAndSchedules?.length) {
      setMedOffices(medOfficesAndSchedules);
    }
  }, [medOfficesAndSchedules]);

  const handleSearch = () => {
    toast({
      title: "Búsqueda",
      description: `Buscando consultorio #${searchQuery}...`,
    });
  };

  const handleUpdateOffice = async (updatedOffice: MedicalOfficeAndSchedule) => {
    const updateOffice = await handleUpdateMedOffice(updatedOffice);
    setMedOffices(medOfficesSchedules.map(c => c.idOffice === updatedOffice.idOffice ? updatedOffice : c));
    setEditingMedicalOffice(null);
    
    toast({
      title: "Consultorio actualizado correctamente",
      description: "El consultorio modificado se puede visualizar en el dashboard de disponibilidad de consultorios",
    });
  };

  const handleDeleteMedOffice = async (idOffice: number) => {
    const deletedOffice = await handleDeleteMedicalOffice(idOffice);
    setMedOffices(medOfficesSchedules.filter(c => c.idOffice !== idOffice));
    setDeletingOffice(null);
    toast({
      title: "Consultorio eliminado",
      description: "El consultorio ha sido eliminado exitosamente",
      variant: "destructive",
    });
  };

  const getStatusDisplay = (medicalOffice: MedicalOfficeAndSchedule) => {
    if (medicalOffice.status === "Mantenimiento" && medicalOffice.startDate && medicalOffice.endDate) {
      return `Mantenimiento: ${medicalOffice.startDate} - ${medicalOffice.endDate}`;
    }
    return medicalOffice.status;
  };

  return (
    <div className="flex-1 bg-medical-light-gray">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Search Bar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-medical-gray" />
            <Input
              placeholder="Buscar por número de consultorio"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="bg-medical-dark text-medical-dark-foreground hover:bg-medical-dark/90"
          >
            Buscar
          </Button>
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
            <div className="space-y-4">
              {medOfficesSchedules.map((medicalOffice) => (
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
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      {editingMedicalOffice && (
        <ClinicEditDialog
          medicalOffice={editingMedicalOffice}
          open={!!editingMedicalOffice}
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