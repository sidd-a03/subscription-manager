import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class VerifyOtpDto {
    @ApiProperty({ example: "john@example.com", required: true })
    @IsEmail()
    email: string;

    @ApiProperty({ example: "123456", required: true })
    @IsString()
    @Length(6)
    otpFromFrontend: string;

    @ApiProperty({ example: "abc123def...1717524442252", required: true })
    @IsString()
    fullHashFromFrontend: string;
}
