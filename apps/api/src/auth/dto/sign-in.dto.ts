import { IsEmail, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignInDto {
    @ApiProperty({example: "john@example.com", required: true})
    @IsEmail()
    email: string;

    @ApiProperty({example: "John@#123", required: true})
    @IsString()
    @MinLength(6)
    password: string;
}