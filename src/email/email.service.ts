import { Injectable, Logger } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { HealthStatus } from 'src/utils/health.utils';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor() {
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
      this.logger.warn(
        '⚠️ Email environment variables missing. Email service won’t work.',
      );
      return;
    }

    this.transporter = createTransport({
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT),
      secure: Number(EMAIL_PORT) === 465,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async verifyConnection(): Promise<HealthStatus> {
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
      return { status: 'skipped', reason: 'Missing Email env vars' };
    }

    if (!this.transporter) {
      return { status: 'failed', error: 'Transporter not initialized' };
    }

    try {
      await this.transporter.verify();
      return { status: 'ok' };
    } catch (error) {
      this.logger.error('SMTP connection failed', error);
      return { status: 'failed', error: error.message };
    }
  }

  async sendTestEmail(to?: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Transporter not initialized.');
      throw new Error('Email transporter not initialized');
    }

    const from = process.env.EMAIL_USER;

    await this.transporter.sendMail({
      from: `"NestJS Toolkit" <${from}>`,
      to: to || from,
      subject: 'Teste de email do toolkit',
      text: 'Se você recebeu este email, o serviço de email está funcionando corretamente!',
    });

    this.logger.log(`Test email sent to ${to || from}`);
  }
}
