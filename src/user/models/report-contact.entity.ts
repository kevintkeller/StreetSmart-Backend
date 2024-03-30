import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ReportContactEntity {

    @PrimaryGeneratedColumn()
    contactId: number;

    @Column()
    reportType: string;

    @Column()
    email: string;
}