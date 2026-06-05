import { createZodDto } from 'nestjs-zod';
import { resetPasswordSchema } from '@repo/dto';

export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {}
