import { useEffect, useState } from "react";
import { findClinicsAndSpecialties } from "@/api/medicalOffice.api";
import { MedicalInformation } from "@/models/MedicalInformation";

export function useMedicalInfo() {
  const [medicalInfo, setMedicalInfo] = useState<MedicalInformation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadMedicalInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await findClinicsAndSpecialties();
      setMedicalInfo(data);
    } catch (err) {
      setError("Error al cargar la información médica");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedicalInfo();
  }, []);

  return { medicalInfo, isLoading, error, reload: loadMedicalInfo };
}