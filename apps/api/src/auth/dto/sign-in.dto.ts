import { createZodDto } from 'nestjs-zod';
import { signInSchema } from '@repo/dto';

export class SignInDto extends createZodDto(signInSchema) {}
