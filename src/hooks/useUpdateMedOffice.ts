import { useState } from "react";
import { updateMedicalOffice } from "@/api/medicalOffice.api";
import { MedicalOfficeCod } from "@/models/MedicalOfficeCod";
import { MedicalOfficeAndSchedule } from "@/models/MedicalOfficeAndSchedule";

export function useUpdateMedOffice(){
    const [medicalOfficeCod, setMedicalOfficeCod] = useState<MedicalOfficeCod | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function handleUpdateMedOffice(medOffice:MedicalOfficeAndSchedule){
        setIsLoading(true);
        setError(null);
        try {
            const updateOffice = await updateMedicalOffice(medOffice.idOffice, medOffice);
            setMedicalOfficeCod(updateOffice);
            return {updateOffice, isLoading, error};
        } catch (err) {
            setError("Error al actualizar nuevo consultorio");
            console.error(err);
        } finally {
            setIsLoading(false);
        }

    }

    return { medicalOfficeCod, isLoading, error, handleUpdateMedOffice };
}