import { Double } from "typeorm";

export interface Report {
    reportId?: number;
    title?: string;
    content?: string;
    latitude?: Double;
    longitude?: Double;
    userId?: number;
    reportStatus?: number;
    imageData?: string;
}