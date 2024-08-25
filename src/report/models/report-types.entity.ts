import { Param } from '@nestjs/common';
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ReportTypesEntity {
    @PrimaryGeneratedColumn()
    reportTypeId: number;

    @Column()
    cityId: number;

    @Column()
    reportType: string;

    @Column()
    description: string;
}