import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import type { VerifyOtpDto } from '@repo/dto';

@Injectable()
export class OtpService {
  private readonly secret: string;

  constructor(private readonly configService: ConfigService) {
    this.secret = this.configService.getOrThrow<string>('otp.secret');
  }

  generateStateLessOtp(email: string): { otpCode: string; fullHash: string } {
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresIn = Date.now() + 5 * 60 * 1000;
    const data = `${email}.${otpCode}.${expiresIn}`;

    const hash = crypto
      .createHmac('sha256', this.secret)
      .update(data)
      .digest('hex');

    const fullHash = `${hash}.${expiresIn}`;

    return { otpCode, fullHash };
  }

  verifyStateLessOtp(frontendData: VerifyOtpDto): boolean {
    const { email, otpCode, fullHash } = frontendData;

    const dotIndex = fullHash.lastIndexOf('.');
    const incomingHash = fullHash.substring(0, dotIndex);
    const expiresIn = fullHash.substring(dotIndex + 1);

    if (Date.now() > parseInt(expiresIn, 10)) return false;

    const data = `${email}.${otpCode}.${expiresIn}`;
    const expectedHash = crypto
      .createHmac('sha256', this.secret)
      .update(data)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedHash, 'hex'),
      Buffer.from(incomingHash, 'hex'),
    );
  }
}
