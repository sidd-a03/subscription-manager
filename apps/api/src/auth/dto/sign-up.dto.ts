import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, IsUrl } from "class-validator";

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

    @IsOptional()
    @IsUrl()
    @ApiProperty({ example: "https://example.com/avatar.jpg", required: false })
    avatarUrl?: string;
}