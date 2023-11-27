import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, from, of } from 'rxjs';
import { User } from 'src/user/models/user.interface';
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
    constructor(private readonly jwtService: JwtService) {}

    generateJWT(user: User): Observable<string> {
        return from(this.jwtService.signAsync(user));
    }

    hashPassword(password: string): Observable<string> {
        return from<string>(bcrypt.hash(password, 12));
    }

    comparePasswords(newPassword: string, passwordHash: string): Observable<any | boolean> {
        return from<any | boolean>(bcrypt.compare(newPassword, passwordHash));
    }
}
