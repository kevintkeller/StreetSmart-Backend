import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ReportContactEntity {
    
    @PrimaryGeneratedColumn()
    reportContactId: number;

    @Column()
    email: string;

    @Column()
    reportTypeId: number;

    @Column()
    cityId: number;
}