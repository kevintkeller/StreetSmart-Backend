import { Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class EmailVerificationEntity {
    @PrimaryGeneratedColumn()
    verificationId: number;

    @Column()
    email: string;

    @Column()
    emailToken: string;

    @Column()
    timestamp: Date;
}