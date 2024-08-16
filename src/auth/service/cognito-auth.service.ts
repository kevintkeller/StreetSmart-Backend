import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import * as AWS from 'aws-sdk';
import { JwtService } from '@nestjs/jwt';
import { CognitoUser, CognitoUserPool, AuthenticationDetails, CognitoUserSession, CognitoRefreshToken, CognitoUserAttribute, ISignUpResult } from 'amazon-cognito-identity-js';
import { RegisterUserInput } from '../models/register-user-input.interface';
import { ConfirmUserInput } from '../models/confirm-user-input.interface';
import { RefreshTokenInput } from '../models/refresh-token-input.interface';
import { ConfirmForgotPasswordInput } from '../models/confirm-forgot-password-input.interface';
import { ForgotPasswordInput } from '../models/forgot-password-input.interface';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

@Injectable()
export class CognitoAuthService {
    private cognito: AWS.CognitoIdentityServiceProvider;
    private userPool: CognitoUserPool;
    private cognitoUserPoolId: string;
    private cognitoUserPoolClientId: string
    private jwksClient: jwksClient.JwksClient;


    constructor(private configService: ConfigService, private jwtService: JwtService) {
        AWS.config.update({
            region: 'us-east-1',
        });
        this.cognitoUserPoolId = this.configService.get('COGNITO_USER_POOL_ID');
        this.cognitoUserPoolClientId = this.configService.get('COGNITO_USER_POOL_CLIENT_ID');
        this.cognito = new AWS.CognitoIdentityServiceProvider();
        this.userPool = new CognitoUserPool({
            UserPoolId: this.cognitoUserPoolId,
            ClientId: this.cognitoUserPoolClientId,
        });
        this.jwksClient = jwksClient({
            jwksUri: this.configService.get('JWKS_URL'),
        });
    }

    public async authenticateUser(email: string, password: string): Promise<any> {
        const username = await this.getUsernameByEmail(email);

        if (!username) {
            throw new Error('User not found.');
        }
        
        return new Promise((resolve, reject) => {
            const user = new CognitoUser({
                Username: username,
                Pool: this.userPool,
            });

            const authDetails = new AuthenticationDetails({
                Username: email,
                Password: password,
            });

            user.authenticateUser(authDetails, {
                onSuccess: (session: CognitoUserSession) => resolve(session),
                onFailure: (err) => reject(new Error('Authentication failed due to the following exception: ' + err.message)),
            });
        });
    }

    // Validate the token using JWKS
    public async validateToken(token: string): Promise<any> {
        try {
            const decodedHeader = jwt.decode(token, { complete: true });
            if (!decodedHeader || typeof decodedHeader === 'string') {
                throw new UnauthorizedException('Invalid token');
            }

            const key = await this.getKey(decodedHeader.header.kid);
            if (!key) {
                throw new UnauthorizedException('Public key not found');
            }

            const decoded = jwt.verify(token, key.publicKey, { algorithms: ['RS256'] });
            return decoded;
        } catch (error) {
                throw new UnauthorizedException('Token validation failed: ' + error.message);
        }
    }

    // Retrieve the public key based on the key ID (kid) from the JWT header
    private async getKey(kid: string): Promise<{ publicKey: string } | null> {
        return new Promise((resolve, reject) => {
            this.jwksClient.getSigningKey(kid, (err, key) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ publicKey: key.getPublicKey() });
                }
            });
        });
    }

    public async refreshTokens(input: RefreshTokenInput): Promise<CognitoUserSession> {
        const { email, refreshToken } = input;

        return new Promise((resolve, reject) => {
            const user = new CognitoUser({
                Username: email,
                Pool: this.userPool,
            });

            // Create CognitoRefreshToken instance
            const cognitoRefreshToken = new CognitoRefreshToken({
                RefreshToken: refreshToken,
            });


            user.refreshSession(cognitoRefreshToken, (err, session) => {
                if (err) {
                    reject(new BadRequestException('Token refresh failed: ' + err.message));
                } else {
                    resolve(session);
                }
            });
        });
    }

    public async getAuthParams(email: string, password: string) {
        return {
            USERNAME: email,
            PASSWORD: password,
        };
    }

    public async getUsernameByEmail(email: string): Promise<string | null> {
        const params = {
            UserPoolId: this.cognitoUserPoolId,
            Filter: `email = "${email}"`,
        };

        try {
            const response = await this.cognito.listUsers(params).promise();

            if ((await response).Users.length > 0) {
                return response.Users[0].Username;
            } else {
                return null;
            }
        } catch (error) {
            throw new Error('An error occurred while retrieving username by email. The following exception occurred: ' + error.message);
        }
    }

    public async registerUser(input: RegisterUserInput): Promise<ISignUpResult> {
        const { email, phoneNumber, name, password } = input;
    
        // Validate and format the phone number
        const formattedPhoneNumber = this.formatPhoneNumber(phoneNumber);
    
        if (!formattedPhoneNumber) {
          throw new BadRequestException('Invalid phone number format.');
        }
    
        return new Promise((resolve, reject) => {
          const attributeList = [
            new CognitoUserAttribute({ Name: 'email', Value: email }),
            new CognitoUserAttribute({ Name: 'phone_number', Value: formattedPhoneNumber }),
            new CognitoUserAttribute({ Name: 'name', Value: name }),
          ];
    
          this.userPool.signUp(email, password, attributeList, [], (err, result) => {
            if (err) {
                if (err.message.includes('UsernameExistsException')) {
                  reject(new BadRequestException('User with this email already exists.'));
                } else {
                  reject(new BadRequestException('Registration failed: ' + err.message));
                }
            } else {
                resolve(result);
            }
          });
        });
      }

    public async confirmUser(input: ConfirmUserInput): Promise<void> {
        const { email, confirmationCode } = input;

        return new Promise((resolve, reject) => {
            const user = new CognitoUser({
                Username: email,
                Pool: this.userPool,
            });

            user.confirmRegistration(confirmationCode, true, (err, result) => {
                if (err) {
                    if (err.code === 'CodeMismatchException') {
                        reject(new BadRequestException('Invalid confirmation code.'));
                    } else if (err.code === 'ExpiredCodeException') {
                        reject(new BadRequestException('Confirmation code has expired.'));
                    } else {
                        reject(new BadRequestException('Confirmation failed: ' + err.message));
                    }
                } else {
                    resolve(result);
                }
            });
        });
    }

    private formatPhoneNumber(phoneNumber: string): string | null {
        const e164Regex = /^\+?[1-9]\d{1,14}$/;
        const cleanedPhoneNumber = phoneNumber.replace(/[^+\d]/g, '');

        if (e164Regex.test(cleanedPhoneNumber)) {
            return cleanedPhoneNumber;
        }
        return null;
    }

    public async forgotPassword(input: ForgotPasswordInput): Promise<void> {
        const { email } = input;
        const username = await this.getUsernameByEmail(email);
        const user = new CognitoUser({
            Username: username,
            Pool: this.userPool,
        });

        return new Promise((resolve, reject) => {
            user.forgotPassword({
                onSuccess: () => {
                    resolve();
                    console.log('yo waddup')
                },
                onFailure: (err) => reject(new BadRequestException('Forgot password failed: ' + err.message)),
            });
        });
    }

    public async confirmForgotPassword(input: ConfirmForgotPasswordInput): Promise<void> {
        const { email, verificationCode, newPassword } = input;
        const username = await this.getUsernameByEmail(email);
        const user = new CognitoUser({
            Username: username,
            Pool: this.userPool,
        });

        return new Promise((resolve, reject) => {
            user.confirmPassword(verificationCode, newPassword, {
                onSuccess: () => resolve(),
                onFailure: (err) => reject(new BadRequestException('Confirm forgot password failed due to the following exception: ' + err.message)),
            });
        });
    }
}