export interface MedicalOfficeAndSchedule{
    idOffice: number,
    idUser: number,
    officeNumber: number,
    clinicName: string,
    specialtyName: string,
    status: string,
    startDate?: string,
    endDate?: string
}