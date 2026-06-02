import { ApiProperty } from "@nestjs/swagger";

export class AuthResponseDto {
    @ApiProperty({ 
        type: String, 
        required: true,
        description: "JWT Access Token",
        example: "access_token"
    })
    access_token: string;
}