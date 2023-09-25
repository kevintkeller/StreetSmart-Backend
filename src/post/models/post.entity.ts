import { UserEntity } from "src/user/models/user.entity";
import { Column, Double, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class PostEntity {
    @PrimaryGeneratedColumn()
    postId: number;
    
    // FOREIGN KEY need user id of post creator
    // THIS MIGHT NOT BE RIGHT
    @ManyToOne(type => UserEntity, userEntity => userEntity.id)
    // might not need to be array
    userEntity: number;
    
    // title
    @Column()
    title: string;

    // content
    @Column()
    content: string
        
    // latitude
    @Column({type: 'decimal', precision: 10, scale: 7, default: 0.0})
    latitude: Double;

    // longitude
    @Column({type: 'decimal', precision: 10, scale: 7, default: 0.0})
    longitude: Double;
}