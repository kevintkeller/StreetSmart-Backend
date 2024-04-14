import { UserVerified } from './../../user/models/user-verified.interface';
import { ForgotPassword } from './../models/forgot-password.interface';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { EMPTY, Observable, catchError, from, map, of, tap } from 'rxjs';
import { User } from 'src/user/models/user.interface';
import { EmailVerificationEntity } from '../models/email-verification.entity';
import { Repository } from 'typeorm';
import { EmailVerification } from '../models/email-verification.interface';
import { TypedEventEmitter } from '../../event-emitter/typed-event-emitter.class';
import { UserEntity } from 'src/user/models/user.entity';
import { UserVerifiedEntity } from 'src/user/models/user-verified.entity';
import { ForgotPasswordEntity } from '../models/forgot-password.entity';
import { Request } from 'express';
const bcrypt = require('bcrypt');


/**
 * JWT TOKEN: JSON WEB TOKEN is an opern standard that defines a compact and
 * self-contained way for securely transmitting between parties as a JSON object.
 * This information can be verified and trusted because it is digitally signed. JWTs
 * can be signed using a secret (with the HMAC algorithm) or a public/private key
 * pair using RSA or ECDSA.
 * 
 * CONTENTS OF A JWT TOKEN:
 *      -Header: typically consists of two parts: the type of the token, which is JWT, and the signing algorithm being used, such as HMAC SHA256 or RSA
 *      -Payload (things we want to send): contains claims. Claims are statements about an entity (typically, the user) and additional data.
 *          There are three types of claims: registered, public, and private claims.
 *      -Signature: To create the signature part you have to take the encoded header, the encoded payload, a secret, the algorithm specified in the header,
 *          and sign that.
 */

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService,
        @InjectRepository(EmailVerificationEntity) private readonly emailVerificationRepository: Repository<EmailVerificationEntity>,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(UserVerifiedEntity) private readonly userVerifiedRepository: Repository<UserVerifiedEntity>,
        @InjectRepository(ForgotPasswordEntity) private readonly forgotPasswordRepository: Repository<ForgotPassword>,
        private readonly eventEmitter: TypedEventEmitter) {

    }

    public generateJWT(user: User): Observable<string> {
        return from(this.jwtService.signAsync(user));
    }

    public hashPassword(password: string): Observable<string> {
        return from<string>(bcrypt.hash(password, 12));
    }

    public comparePasswords(newPassword: string, passwordHash: string): Observable<any | boolean> {
        return from<any | boolean>(bcrypt.compare(newPassword, passwordHash));
    }

    public async createEmailToken(email: string): Promise<boolean> {
        let emailVerification: EmailVerification = await this.emailVerificationRepository.query('SELECT * FROM email_verification_entity WHERE email=\"' + email + '\" ORDER BY timeStamp DESC');
        if (emailVerification && ((new Date().getTime() - emailVerification[0]?.timestamp.getTime()) / 60000 < .5)) {
            throw new HttpException('LOGIN.EMAIL_SENT_RECENTLY', HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
            await this.emailVerificationRepository.query('REPLACE INTO email_verification_entity(email, emailToken, timeStamp) VALUES(\"' + email + '\"' + ', \"' + (Math.floor(Math.random() * (9000000)) + 1000000).toString() + '\", NOW());');
            return true;
        }
    }

    public async sendEmailVerification(email: string): Promise<boolean> {
        let entity = await this.emailVerificationRepository.query('SELECT * FROM email_verification_entity WHERE email=\"' + email + '\"')
        if (entity && entity[0].emailToken) {
            this.eventEmitter.emit('user.verify-email', {
                name: "New User",
                email: entity[0].email,
                otp: entity[0].emailToken
            });
            return true;
        } else {
            throw new HttpException('REGISTER.USER_NOT_REGISTERED', HttpStatus.FORBIDDEN);
        }
    }

    public async verifyEmail(token: string): Promise<boolean> {
        let emailVerif = await this.emailVerificationRepository.query('SELECT * FROM email_verification_entity WHERE emailToken = ' + token);
        if (emailVerif && emailVerif[0]?.email) {
            let user = await this.userRepository.query('SELECT * FROM user_entity WHERE email = \"' + emailVerif[0]?.email + "\"");
            if (user) {

                let savedUser: UserVerified = {
                    id: user[0].id,
                    name: user[0].name,
                    username: user[0].username,
                    email: user[0].email,
                    password: user[0].password
                }

                this.createVerified(savedUser).pipe(
                    map((savedUser: UserVerified) => savedUser),
                    catchError(err => of({error: err.message})),
                    tap(err => console.log(err))
                );

                this.userRepository.remove(user[0]);

                return !!savedUser;
            } else {
                throw new HttpException('LOGIN.EMAIL_CODE_NOT_VALID', HttpStatus.FORBIDDEN);
            }
        } else {
            console.log('An email does not exist that is associated with this token.');
        }
    }

    public createVerified(userVerified: UserVerified): Observable<UserVerified> {
        const newUserVerified = new UserVerifiedEntity();
        newUserVerified.id = userVerified.id;
        newUserVerified.name = userVerified.name;
        newUserVerified.username = userVerified.username;
        newUserVerified.email = userVerified.email;
        newUserVerified.password = userVerified.password;
        newUserVerified.jobFunction = '';
        newUserVerified.phoneNumber = '';
        newUserVerified.profilePictureData = '';
        newUserVerified.adminFlg = 0;

        return from(this.userVerifiedRepository.save(newUserVerified)).pipe(
            map((userVerified: UserVerified) => {
                const {password, ...result} = userVerified;
                return result;
            }),
            catchError((err, caught) => {
                console.log(err);
                return EMPTY;
            })
        )
    }

    public async sendEmailForgotPassword(email: string): Promise<boolean> {
        const entity = await this.userVerifiedRepository.query('SELECT * FROM user_verified_entity WHERE email=\"' + email + '\"')
        if (!entity) return false;
        const tokenModel = await this.createForgottenPasswordToken(email);
        
        if (tokenModel && tokenModel[0].forgotPasswordToken) {
            this.eventEmitter.emit('user.forgot-password', {
                name: "New User",
                email: entity[0].email,
                otp: tokenModel[0].forgotPasswordToken,
            });
            return true;
        } else {
            throw new HttpException('REGISTER.USER_NOT_REGISTERED', HttpStatus.FORBIDDEN);
        }
    }

    public async createForgottenPasswordToken(email: string): Promise<ForgotPassword> {
        let forgottenPassword =  await this.forgotPasswordRepository.query('SELECT * FROM forgot_password_entity WHERE email=\"' + email + '\" ORDER BY timeStamp DESC');
        if (forgottenPassword && ((new Date().getTime() - forgottenPassword[0]?.timestamp.getTime()) / 60000 < .5)) {
            throw new HttpException('LOGIN.EMAIL_SENT_RECENTLY', HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
            const forgotPasswordModel = await this.forgotPasswordRepository.query('REPLACE INTO forgot_password_entity(email, forgotPasswordToken, timeStamp) VALUES(\"' + email + '\"' + ', \"' + (Math.floor(Math.random() * (9000000)) + 1000000).toString() + '\", NOW());');
            return this.forgotPasswordRepository.query('SELECT * FROM forgot_password_entity WHERE email=\"' + email + '\" ORDER BY timeStamp DESC');
        }
    }

    public async checkPassword(email: string, password: string) {
        let existingUser = await this.userVerifiedRepository.query("SELECT * FROM user_verified_entity WHERE email = \'" + email + "\'");
        if (!existingUser) {
            throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
        }
        return await bcrypt.compare(password, existingUser[0].password);
    }

    public async getForgottenPasswordModel(newPasswordToken: string): Promise<ForgotPassword> {
        return await this.forgotPasswordRepository.query("SELECT * FROM forgot_password_entity WHERE forgotPasswordToken = \'" + newPasswordToken + "\'");
    }

    public async removeForgottenPasswordModel(forgotPassword: ForgotPassword): Promise<ForgotPassword> {
        return await this.forgotPasswordRepository.remove(forgotPassword);
    }
}
