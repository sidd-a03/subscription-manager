import { createZodDto } from 'nestjs-zod';
import { signUpSchema } from '@repo/dto';

export class SignUpDto extends createZodDto(signUpSchema) {}
