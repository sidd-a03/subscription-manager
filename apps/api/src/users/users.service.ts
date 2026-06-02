import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: {
                email
            }
        })
    }

    async findById(userId: string) {
        return this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })
    }

    async create(userData: SignUpDto) {
        return this.prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                password: userData.password,
            }
        })
    }

    async updateRtHash(userId: string, hashRt: string | null): Promise<void> {
        await this.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                refreshToken: hashRt
            }
        })
    }
}
