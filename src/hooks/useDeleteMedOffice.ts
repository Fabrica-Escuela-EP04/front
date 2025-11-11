import { useState } from "react";
import { deleteMedicalOffice } from "@/api/medicalOffice.api";
import { MedicalOffice } from "@/models/MedicalOffice";

export function useDeleteMedOffice(){
    const [medicalOffice, setMedicalOffice] = useState<MedicalOffice | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function handleDeleteMedicalOffice(idOffice:number){
        setIsLoading(true);
        setError(null);
        try {
            const deletedOffice = await deleteMedicalOffice(idOffice);
            setMedicalOffice(deletedOffice);
            return {deletedOffice, isLoading, error};
        } catch (err) {
            setError("Error al actualizar nuevo consultorio");
            console.error(err);
        } finally {
            setIsLoading(false);
        }

    }
    
    return { medicalOffice, isLoading, error, handleDeleteMedicalOffice };
}