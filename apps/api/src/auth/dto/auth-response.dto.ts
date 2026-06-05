import { createZodDto } from 'nestjs-zod';
import { authResponseSchema } from '@repo/dto';

export class AuthResponseDto extends createZodDto(authResponseSchema) {}
