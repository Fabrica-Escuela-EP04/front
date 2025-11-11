import { useState, useEffect } from "react";
import { findAllMedicalOffices } from "@/api/medicalOffice.api";
import { MedicalOfficeAndSchedule } from "@/models/MedicalOfficeAndSchedule";

export function useFindAllMedOffices() {
    const [medOfficesAndSchedules, setMedOffAndSchedule] = useState<MedicalOfficeAndSchedule[]>([]);

    const findAllOffices = async () => {
        const medicalOfficesAndSchedules = await findAllMedicalOffices();
        setMedOffAndSchedule(medicalOfficesAndSchedules);
    }

    useEffect(() => {
        findAllOffices();
      }, []);

    return { medOfficesAndSchedules, reload: findAllOffices};
}

