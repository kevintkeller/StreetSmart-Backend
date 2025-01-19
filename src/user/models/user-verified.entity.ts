import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity()
export class UserVerifiedEntity {

    @PrimaryGeneratedColumn()
    verifiedId: number;

    @Column()
    id: number;

    @Column()
    name: string;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    jobFunction: string;

    @Column()
    phoneNumber: string;

    @Column()
    profilePictureData: string;

    @Column()
    adminFlg: number;
}