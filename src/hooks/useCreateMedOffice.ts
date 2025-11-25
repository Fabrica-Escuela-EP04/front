import { useState } from "react";
import { createMedicalOffice } from "@/api/medicalOffice.api";
import { MedicalOffice } from "@/models/MedicalOffice";
import { MedicalOfficeCod } from "@/models/MedicalOfficeCod";

export function useCreateMedOffice(){
    const [medicalOfficeCod, setMedicalOfficeCod] = useState<MedicalOfficeCod | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleCreateMedicalOffice(newOffice:MedicalOffice){
        setError(null);
        try {
            const createdOffice = await createMedicalOffice(newOffice);
            setMedicalOfficeCod(createdOffice);
            return {createdOffice, error};
            } catch (err) {
                const createdOffice = null
                setError("Error al crear el nuevo consultorio, intente más tarde.");
                return {createdOffice, error}
            } 
    }

    return { medicalOfficeCod, error, handleCreateMedicalOffice };
}
