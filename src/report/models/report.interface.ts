import { Double } from "typeorm";

export interface Report {
    reportId?: number;
    title?: string;
    content?: string;
    latitude?: Double;
    longitude?: Double;
    userEmail?: string;
    reportStatusId?: number;
    reportTypeId?: number;
    createdDate?: Date;
    resolvedDate?: Date;
    imageData?: string;
    cityId?: number;
}