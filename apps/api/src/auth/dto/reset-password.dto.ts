import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Length } from "class-validator";

export class ResetPasswordDto {
    @ApiProperty({ example: "john@example.com", required: true })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ example: "123456", required: true })
    @IsString()
    @Length(6)
    otpCode: string;

    @ApiProperty({ example: "New@1234", required: true })
    @IsStrongPassword()
    newPassword: string;

    @ApiProperty({ example: "a3f1b2c4...abc.1717524442252", required: true })
    @IsNotEmpty()
    @IsString()
    fullHash: string;
}