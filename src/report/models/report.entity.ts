import { UserEntity } from "src/user/models/user.entity";
import { Column, Double, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class ReportEntity {
    @PrimaryGeneratedColumn()
    reportId: number;
    
    // title
    @Column()
    title: string;

    // content
    @Column()
    content: string;
        
    // latitude
    @Column({type: 'decimal', precision: 10, scale: 7, default: 0.0})
    latitude: Double;

    // longitude
    @Column({type: 'decimal', precision: 10, scale: 7, default: 0.0})
    longitude: Double;
    
    @Column()
    userId: number;
}