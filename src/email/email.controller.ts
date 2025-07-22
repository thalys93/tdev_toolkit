import { Controller, Get, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { HealthStatus } from 'src/utils/health.utils';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Email Module')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('check')
  async check(): Promise<HealthStatus> {
    const status = await this.emailService.verifyConnection();
    return status;
  }

  @Get('send-test')
  async sendTest(@Query('to') to?: string): Promise<{ message: string }> {
    await this.emailService.sendTestEmail(to);
    return { message: `Test email sent to ${to || process.env.EMAIL_USER}` };
  }
}
