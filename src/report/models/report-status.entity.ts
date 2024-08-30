import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ReportStatusEntity {
    @PrimaryGeneratedColumn()
    reportStatusId: number;

    @Column()
    cityId: number;

    @Column()
    reportStatus: string;

    @Column()
    description: string;

    @Column()
    hexColorValue: string;
}