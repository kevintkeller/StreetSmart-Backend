import { UserEntity } from "src/user/models/user.entity";
import { Column, Double, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";


@Entity()
export class ReportEntity {
    @PrimaryGeneratedColumn()
    reportId: number;

    @Column()
    title: string;

    @Column()
    content: string;
        
    @Column({type: 'decimal', precision: 10, scale: 7, default: 0.0})
    latitude: Double;

    @Column({type: 'decimal', precision: 10, scale: 7, default: 0.0})
    longitude: Double;
    
    @Column()
    userId: number;

    @Column()
    reportStatus: number;

    @Column({
        type: "longblob",

    })
    imageData: string;
}