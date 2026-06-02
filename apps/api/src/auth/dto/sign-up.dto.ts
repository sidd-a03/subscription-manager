import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class SignUpDto {
    @ApiProperty({ example: "John Doe"})
    @IsNotEmpty()
    @IsString()
    name: string

    @ApiProperty({ example: "john@example.com"})
    @IsEmail()
    email: string

    @ApiProperty({ example: "John@#123"})
    @IsStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    password: string
}