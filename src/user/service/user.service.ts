import { AuthService } from '../../auth/service/auth.service';
import { Observable, from } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../models/user.entity';
import { Repository } from 'typeorm';
import { User } from '../models/user.interface';
import { switchMap, map, catchError, tap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { UserVerifiedEntity } from '../models/user-verified.entity';

@Injectable()
export class UserService {

    constructor(@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
                    @InjectRepository(UserVerifiedEntity) private readonly userVerifiedRepository: Repository<UserVerifiedEntity>,
                    private authService: AuthService) {}

    public create(user: User): Observable<User> {
        const hashed = this.authService.hashPassword(user.password).pipe(
            switchMap((pass: string) => {
                const newUser = new UserEntity();
                newUser.name = user.name;
                newUser.username = user.username;
                newUser.email = user.email;
                newUser.password = pass;
                return from(this.userRepository.save(newUser)).pipe(
                    map((user: User) => {
                        const {password, ...result} = user;
                        return result;
                    }),
                    catchError((err, caught) => {
                        return EMPTY;
                    })
                )
            })
        );
        
        hashed.subscribe(x=>console.log(x));
        return hashed;
    }


    public findOneBy(id: number): Observable<User> {
        return from(this.userVerifiedRepository.findOneBy({id})).pipe(
            map((user: User) => {
                const {password, ...result} = user;
                return result;
            })
        )
    }

    public findOneByUsername(user: any): any {
        console.log(user);
        return this.userVerifiedRepository.query('SELECT verifiedId FROM user_verified_entity WHERE email = \"' + user + '\"');
    }

    public findAll(): Observable<User[]> {
        return from(this.userVerifiedRepository.find()).pipe(
            map((users) => {
                users.forEach(function (v) {delete v.password});
                return users;
            })
        );
    }

    public deleteOne(id: number): Observable<any> {
        return from(this.userRepository.delete(id));
    }

    public updateOne(id: number, user: User): Observable<any> {
        delete user.email;
        delete user.password;
        
        return from(this.userRepository.update(id, user)).pipe(
            switchMap(()=>this.findOneBy(id))
        );
    }

    public login(user: User): Observable<string> {
        return this.validateUser(user.email, user.password).pipe(
            switchMap((user: User) => {
                if(user) {
                    return this.authService.generateJWT(user).pipe(map((jwt: string) => jwt));
                } else {
                    return 'Incorrect username or password.';
                }
            })
        )
    }

    public validateUser(email: string, password: string): Observable<User> {
        return this.findByMail(email).pipe(
            switchMap((user: User) => this.authService.comparePasswords(password, user.password).pipe(
                map((match: boolean) => {
                    if(match) {
                        const {password, ...result} = user;
                        return result;
                    } else {
                        console.log('hit4');
                        throw Error;
                    }
                })
            ))
        )
    }

    public findByMail(email: string): Observable<User> {
        return from(this.userVerifiedRepository.findOneBy({email}));
    }

    public getAdminFlg(id: number): any {
        console.log(id);
        return this.userVerifiedRepository.query("SELECT adminFlg FROM user_verified_entity WHERE verifiedId = " + id);
    }

    public updateVerifiedUser(email: string, password: string) {
        console.log(password);
        return this.authService.hashPassword(password).subscribe((result) => {
            password = result;
            console.log('UPDATE user_verified_entity SET email = \"' + email + '\", ' + 'password = \"' + password + '\" WHERE email = \"' + email + '\"');
            return this.userVerifiedRepository.query('UPDATE user_verified_entity SET email = \"' + email + '\", ' + 'password = \"' + password + '\" WHERE email = \"' + email + '\"');
        });
    }
}
