import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CityEntity {
    @PrimaryGeneratedColumn()
    cityId: number;

    @Column()
    cityName: string;
}