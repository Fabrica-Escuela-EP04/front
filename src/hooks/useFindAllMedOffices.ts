import { useState } from "react";
import { findAllMedicalOffices } from "@/api/medicalOffice.api";
import { MedicalOfficeAndSchedule } from "@/models/MedicalOfficeAndSchedule";

export function useFindAllMedOffices() {
    const [medOfficesAndSchedules, setMedOffAndSchedule] = useState<MedicalOfficeAndSchedule[]>([]);

    async function findAllOffices() {
        const medicalOfficesAndSchedules = await findAllMedicalOffices();
        setMedOffAndSchedule(medicalOfficesAndSchedules);
        return medicalOfficesAndSchedules;
    }

    return { medOfficesAndSchedules, findAllOffices};
}

