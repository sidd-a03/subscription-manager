import { Injectable } from '@nestjs/common';
import { SignUpDto } from 'src/auth/dto/sign-up.dto';
import { PrismaService } from 'src/prisma/prisma.service';

interface CreateUserData {
    name: string;
    email: string;
    password: string | null;
    avatarUrl?: string | null;
}

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

    async create(userData: CreateUserData | SignUpDto) {
        return this.prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                password: userData.password ?? null,
                avatarUrl: userData.avatarUrl ?? null
            }
        })
    }

    async updateProfilePic(userId: string, avatarUrl: string): Promise<void> {
        await this.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                avatarUrl: avatarUrl
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
