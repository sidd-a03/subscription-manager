import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UsersService) { }

    async signUp(data: SignUpDto) {
        
    }
}
