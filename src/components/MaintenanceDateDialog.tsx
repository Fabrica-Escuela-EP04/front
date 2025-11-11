import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

interface MaintenanceDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (startDate: string, endDate: string) => void;
}

export function MaintenanceDateDialog({ open, onOpenChange, onConfirm }: MaintenanceDateDialogProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleConfirm = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Por favor seleccione ambas fechas",
        variant: "destructive",
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Error",
        description: "La fecha de inicio debe ser anterior a la fecha fin",
        variant: "destructive",
      });
      return;
    }

    const formattedStart = format(startDate, "dd/MM/yyyy");
    const formattedEnd = format(endDate, "dd/MM/yyyy");

    // Show success dialog
    toast({
      title: "Asignacion Exitosa",
      description: `Mantenimiento Programado Asignado el día: ${formattedStart} hasta el día: ${formattedEnd}`,
    });

    onConfirm(formattedStart, formattedEnd);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Asignar Fecha de Mantenimiento
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Fecha Inicio
            </div>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              locale={es}
              className="rounded-md border"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Fecha Fin
            </div>
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              locale={es}
              className="rounded-md border"
            />
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
            onClick={handleConfirm}
            className="w-32 bg-medical-dark text-medical-dark-foreground hover:bg-medical-dark/90"
          >
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}