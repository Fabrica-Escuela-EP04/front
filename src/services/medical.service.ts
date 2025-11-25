import { findAllMedicalOffices } from "@/api/medicalOffice.api";
import { findClinicsAndSpecialties } from "@/api/medicalOffice.api";

export async function loadInitialDashboardData() {
  const [medicalInfo, medOfficesAndSchedules] = await Promise.all([
    findClinicsAndSpecialties(),
    findAllMedicalOffices()
  ]);

  return { medicalInfo, medOfficesAndSchedules };
}