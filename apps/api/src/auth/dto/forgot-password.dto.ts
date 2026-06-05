import { createZodDto } from 'nestjs-zod';
import { forgotPasswordSchema } from '@repo/dto';

export class ForgotPasswordDto extends createZodDto(forgotPasswordSchema) {}
