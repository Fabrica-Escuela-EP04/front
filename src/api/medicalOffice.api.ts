import { http } from "./httpClient";
import { MedicalInformation } from "@/models/MedicalInformation";
import { MedicalOffice } from "@/models/MedicalOffice";
import { MedicalOfficeAndSchedule } from "@/models/MedicalOfficeAndSchedule";
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

export async function findAllMedicalOffices(): Promise<MedicalOfficeAndSchedule[]>{
    return http<MedicalOfficeAndSchedule[]>("/medical-offices/all", {
        method: "GET",
    });
}

export async function updateMedicalOffice(idOffice:number, medicalOffice:MedicalOfficeAndSchedule): Promise<MedicalOfficeCod>{
    return http<MedicalOfficeCod>(`/medical-offices/update/${idOffice}`, {
      method: "POST",
      body: JSON.stringify(medicalOffice)
    });
}

export async function deleteMedicalOffice(idOffice:number): Promise<MedicalOffice>{
  return http<MedicalOffice>(`/medical-offices/delete/${idOffice}`, {
    method: "DELETE",
  });
}