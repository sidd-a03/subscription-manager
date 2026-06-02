import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dto/sign-up.dto';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tokens } from './types';

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

    async updateHashRt(userId: string, refresh_token: string): Promise<void> {

        const hashRt = crypto.createHash("sha256").update(refresh_token).digest('hex');

        await this.userService.updateRtHash(userId, hashRt);
    }
}
