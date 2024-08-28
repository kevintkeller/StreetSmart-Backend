import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class ReportContactEntity {
    @PrimaryColumn()
    email: string;

    @Column()
    reportTypeId: number;

    @Column()
    cityId: number;
}