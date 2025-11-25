import { useState } from "react";
import { findClinicsAndSpecialties } from "@/api/medicalOffice.api";
import { MedicalInformation } from "@/models/MedicalInformation";

export function useMedicalInfo() {
  const [medicalInfo, setMedicalInfo] = useState<MedicalInformation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMedicalInfo() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await findClinicsAndSpecialties();
      setMedicalInfo(data);
      return data;
    } catch (err) {
      setError("Error al cargar la información médica");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
    
  }

  return { medicalInfo, isLoading, error, loadMedicalInfo };
}