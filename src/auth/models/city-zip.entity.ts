import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class CityZipEntity {
    @PrimaryColumn()
    cityId: number;

    @Column()
    zipCode: string;
}