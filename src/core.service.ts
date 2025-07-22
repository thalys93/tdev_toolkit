import { Injectable } from '@nestjs/common';
import { HealthStatus, HealthUtils } from './utils/health.utils';
import { EmailService } from './email/email.service';

type SystemCheckResult = {
  data_service: HealthStatus;
  cloudinary_service: HealthStatus;
  email_service: HealthStatus;
  last_check: string;
};

@Injectable()
export class CoreService {
  constructor(
    private readonly utils: HealthUtils,
    private readonly emailService: EmailService,
  ) {}

  async systemCheck(): Promise<SystemCheckResult> {
    const [database, cloudinary, email] = await Promise.all([
      this.utils.checkDatabase(),
      this.utils.checkCloudinary(),
      this.emailService.verifyConnection(),
    ]);

    return {
      data_service: database,
      cloudinary_service: cloudinary,
      email_service: email,
      last_check: new Date().toISOString(),
    };
  }

  // generateCloudinarySignature(publicId: string) {
  //   const timestamp = Math.floor(Date.now() / 1000);
  //   const signature = cloudinary.utils.api_sign_request(
  //     {
  //       timestamp,
  //       public_id: publicId,
  //     },
  //     this.configService.get('CLOUDINARY_API_SECRET'),
  //   );
  //   return {
  //     timestamp,
  //     signature,
  //     public_id: publicId,
  //     api_key: this.configService.get('CLOUDINARY_API_KEY'),
  //   };
  // }
}
