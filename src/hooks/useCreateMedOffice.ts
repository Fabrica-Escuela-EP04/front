import { useState } from "react";
import { createMedicalOffice } from "@/api/medicalOffice.api";
import { MedicalOffice } from "@/models/MedicalOffice";
import { MedicalOfficeCod } from "@/models/MedicalOfficeCod";

export function useCreateMedOffice(){
    const [medicalOfficeCod, setMedicalOfficeCod] = useState<MedicalOfficeCod | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function handleCreateMedicalOffice(newOffice:MedicalOffice){
        setIsLoading(true);
        setError(null);
        try {
            const createdOffice = await createMedicalOffice(newOffice);
            setMedicalOfficeCod(createdOffice);
            return {createdOffice, isLoading, error};
            } catch (err) {
                setError("Error al crear el nuevo consultorio");
                console.error(err);
            } finally {
                setIsLoading(false);
            }

    }

    return { medicalOfficeCod, isLoading, error, handleCreateMedicalOffice };
}
