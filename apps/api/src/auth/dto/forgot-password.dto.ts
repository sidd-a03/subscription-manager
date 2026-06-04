import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class ForgotPasswordDto {
    @ApiProperty({example: "john@example.com", required: true})
    @IsEmail()
    email: string;
}