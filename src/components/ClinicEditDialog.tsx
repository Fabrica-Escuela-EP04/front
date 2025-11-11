import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaintenanceDateDialog } from "@/components/MaintenanceDateDialog";
import { MedicalOfficeAndSchedule } from "@/models/MedicalOfficeAndSchedule";
import { useMedicalInfo } from "@/hooks/useMedicalInfo";

interface ClinicEditDialogProps {
  medicalOffice: MedicalOfficeAndSchedule;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (medicalOffice: MedicalOfficeAndSchedule) => void;
}

export function ClinicEditDialog({ medicalOffice, open, onOpenChange, onSave }: ClinicEditDialogProps) {
  const [formData, setFormData] = useState<MedicalOfficeAndSchedule>(medicalOffice);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const { medicalInfo, isLoading, error } = useMedicalInfo();

  useEffect(() => {
    setFormData(medicalOffice);
  }, [medicalOffice]);

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value });
    
    if (value === "Mantenimiento") {
      setShowMaintenanceDialog(true);
    } else {
      // Clear maintenance dates if not in maintenance
      setFormData(prev => ({ ...prev, maintenanceStart: undefined, maintenanceEnd: undefined }));
    }
  };

  const handleMaintenanceDatesSet = (startDate: string, endDate: string) => {
    setFormData({
      ...formData,
      status: "Mantenimiento",
      startDate: startDate,
      endDate: endDate,
    });
    setShowMaintenanceDialog(false);
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <>
      <Dialog open={open && !showMaintenanceDialog} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              ACTUALIZANDO CONSULTORIO
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Numero de Consultorio</Label>
                <Input
                  id="number"
                  value={formData.officeNumber}
                  onChange={(e) => setFormData({ ...formData, officeNumber: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.specialtyName} onValueChange={(value) => setFormData({ ...formData, specialtyName: value })}>
                  <SelectTrigger id="type">
                    <SelectValue />
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
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Sede</Label>
                <Select value={formData.clinicName} onValueChange={(value) => setFormData({ ...formData, clinicName: value })}>
                  <SelectTrigger id="location">
                    <SelectValue />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado Tecnico</Label>
                <Select value={formData.status} onValueChange={handleStatusChange}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                    <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
              className="w-32"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="w-32 bg-medical-dark text-medical-dark-foreground hover:bg-medical-dark/90"
            >
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MaintenanceDateDialog
        open={showMaintenanceDialog}
        onOpenChange={setShowMaintenanceDialog}
        onConfirm={handleMaintenanceDatesSet}
      />
    </>
  );
}