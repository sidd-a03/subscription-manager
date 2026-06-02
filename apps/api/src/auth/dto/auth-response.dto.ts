import { ApiProperty } from "@nestjs/swagger";

export class AuthResponseDto {
    @ApiProperty({ 
        type: String, 
        required: true,
        description: "JWT Access Token",
        example: "access_token"
    })
    access_token: string;

    @ApiProperty({
        type: String,
        required: true,
        description: "JWT Refresh Token",
        example: "refresh_token"
    })
    refresh_token: string
}