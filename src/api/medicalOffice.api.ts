import { http } from "./httpClient";
import { MedicalInformation } from "@/models/MedicalInformation";
import { MedicalOffice } from "@/models/MedicalOffice";
import { MedicalOfficeCod} from "@/models/MedicalOfficeCod";

export async function findClinicsAndSpecialties(): Promise<MedicalInformation> {
  return http<MedicalInformation>("/medical-offices", {
    method: "GET",
  });
}

export async function createMedicalOffice(newMedicalOffice: MedicalOffice): Promise<MedicalOfficeCod>{
    return http<MedicalOfficeCod>("/medical-offices/create-by-name", {
        method: "POST",
        body: JSON.stringify(newMedicalOffice)
    });
}