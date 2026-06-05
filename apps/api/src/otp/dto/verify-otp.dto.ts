import { createZodDto } from 'nestjs-zod';
import { verifyOtpSchema } from '@repo/dto';

export class VerifyOtpDto extends createZodDto(verifyOtpSchema) {}
