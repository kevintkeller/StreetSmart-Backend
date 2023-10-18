import { Injectable, Post } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '../models/post.entity';
import { Repository } from 'typeorm';
import { UserPost } from '../models/post.interface';
import { Observable, map, switchMap, catchError, throwError, from } from 'rxjs';


@Injectable()
export class PostService {

    constructor(
        @InjectRepository(PostEntity) private readonly postRepository: Repository<PostEntity>
    ){}

    create(post: UserPost): Observable<void | UserPost> {

        const newPost = new PostEntity();
        newPost.title = post.title;
        newPost.content = post.content;
        newPost.latitude = Number(post.latitude);
        newPost.longitude = Number(post.longitude);
        newPost.userEntity = post.userId;
        
        return from(this.postRepository.save(newPost)).pipe(
            map((post: PostEntity) => {
                const {...result} = post;
                return;
            }),
            catchError(err => throwError(err))
        )
    }

    findOneBy(postId: number): any {
        return this.postRepository.query("SELECT userEntityId FROM post_entity WHERE postId = " + postId);
    }

    // this one is done
    deleteOne(postId: number): Observable<any> {
        return from(this.postRepository.delete(postId));
    }

    findAll(): Observable<PostEntity[]> {
        return from(this.postRepository.find()).pipe(
            map((posts) => {
                return posts;
            })
        );
    }

}
