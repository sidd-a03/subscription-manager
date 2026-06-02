import { BadRequestException, ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dto/sign-up.dto';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tokens } from './types';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    async signUp(userData: SignUpDto): Promise<Tokens> {
        const existingUser = await this.userService.findByEmail(userData.email);

        if(existingUser)
            throw new ConflictException("User with this email already exist");

        const pepper = this.configService.get<string>("pepper.argon_pepper")

        const hashedPassword = await argon2.hash(userData.password, {
            type: argon2.argon2id,
            secret: Buffer.from(pepper!),
            memoryCost: 65536,
            timeCost: 1,
            parallelism: 1,            
        });

        const newUser = await this.userService.create({
            name: userData.name,
            email: userData.email,
            password: hashedPassword
        })

        const tokens = await this.geToken(newUser.id, newUser.name);
        
        await this.updateHashRt(newUser.id, tokens.refresh_token);
        
        return tokens;
    }

    async signIn(userData: SignInDto): Promise<Tokens> {
        const user = await this.userService.findByEmail(userData.email);

        if(!user)
            throw new UnauthorizedException("Invalid credentials");

        if(!user.password)
            throw new UnauthorizedException("This account uses Google sign-in. Please log in with Google.");

        const pepper = this.configService.get<string>("pepper.argon_pepper")

        const passwordMatch = await argon2.verify(user.password, userData.password, {
            secret: Buffer.from(pepper!)
        })

        if(!passwordMatch)
            throw new UnauthorizedException("Invalid credentials");

        const tokens = await this.geToken(user.id, user.name);
        
        await this.updateHashRt(user.id, tokens.refresh_token);

        return tokens;
    }

    async logout(userId: string): Promise<{ message: string }> {
        await this.userService.updateRtHash(userId, null);
        return {
            message: "User logout Successfully"
        }      
    }

    async geToken(userId: string, name: string): Promise<Tokens> {
        const jwtPayload = {
            sub: userId,
            name
        }

        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync(jwtPayload, {
                secret: this.configService.get<string>("jwt.access_secret"),
                expiresIn: "15m"
            }),

            this.jwtService.signAsync(jwtPayload, {
                secret: this.configService.get<string>("jwt.refresh_secret"),
                expiresIn: "7d"
            })
        ])

        return { access_token, refresh_token };
    }

    async updateHashRt(userId: string, refresh_token: string | null): Promise<void> {
        const hashRt = refresh_token
            ? crypto.createHash("sha256").update(refresh_token).digest('hex')
            : null;

        await this.userService.updateRtHash(userId, hashRt);
    }

    async refreshToken(userId: string, incomingRefreshToken: string): Promise<Tokens> {
        const user = await this.userService.findById(userId);

        if(!user || !user.refreshToken)
            throw new ForbiddenException("Access Denied");

        const incomingTokenHash = crypto.createHash("sha256").update(incomingRefreshToken).digest('hex');
        
        const matchRefreshToken = crypto.timingSafeEqual(Buffer.from(user.refreshToken), Buffer.from(incomingTokenHash));
        
        if(!matchRefreshToken)
            throw new ForbiddenException("Access Denied");
        
        const tokens = await this.geToken(user.id, user.name);
        
        await this.updateHashRt(user.id, tokens.refresh_token);

        return tokens;
    }

    async googleLogIn(reqUser: any): Promise<Tokens> {
        if(!reqUser)
            throw new BadRequestException("No user from google");

        let user = await this.userService.findByEmail(reqUser.email);

        if(!user) {
            user = await this.userService.create({
                email: reqUser.email,
                name: `${reqUser.firstName} ${reqUser.lastName}`,
                password: null, // No password for Google-auth users
                avatarUrl: reqUser.picture
            });
        } else if(!user.avatarUrl && reqUser.picture) {
            await this.userService.updateProfilePic(
                user.id,
                reqUser.picture
            )
        }

        const tokens = await this.geToken(user.id, user.name);
        
        await this.updateHashRt(user.id, tokens.refresh_token);

        return tokens;
        
    }
}
