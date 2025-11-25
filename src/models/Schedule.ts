import { string } from "zod"

export interface Schedule{
    idSchedule: number,
    idUser: number,
    type: string,
    idOffice: number,
    startDate: Date,
    endDate: Date
}