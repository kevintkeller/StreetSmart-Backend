import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ForgotPasswordEntity {
    @PrimaryGeneratedColumn()
    forgotPasswordId: number;

    @Column()
    email: string;

    @Column()
    forgotPasswordToken: string;

    @Column()
    timeStamp: Date;
}