import { Clinic } from "./Clinic";
import { Specialty } from "./Specialty";

export interface MedicalInformation {
  clinics?: Clinic[];
  specialties?: Specialty[];
}