export interface AdminUser {
    name: string;
    email: string;
    zipCode: string;
    cityId: number;
    roles?: string[];
}