import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as handlebars from 'handlebars';
import { HealthStatus } from 'src/utils/health.utils';
import { SendEmailDto, SendTemplateEmailDto } from './dto';
import { EmailTemplate, EmailConfig, SendEmailResult } from './interfaces';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private emailConfig: EmailConfig;
  private templates: Map<string, EmailTemplate> = new Map();

  constructor() {
    this.initializeEmailConfig();
    this.initializeTransporter();
    this.loadTemplates();
  }

  private initializeEmailConfig(): void {
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USERNAME,
      SMTP_PASSWORD,
      EMAIL_FROM_NAME = 'TDev Toolkit',
      SMTP_SECURE = 'false',
    } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USERNAME || !SMTP_PASSWORD) {
      this.logger.warn(
        "⚠️ Email environment variables missing. Email service won't work.",
      );
      this.logger.warn(
        'Required variables: SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD',
      );
      return;
    }

    this.emailConfig = {
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD,
      },
      from: {
        name: EMAIL_FROM_NAME,
        email: SMTP_USERNAME,
      },
    };

    this.logger.log(
      `Email service initialized with host: ${SMTP_HOST}:${SMTP_PORT}`,
    );
  }

  private initializeTransporter(): void {
    if (!this.emailConfig) return;

    this.transporter = createTransport({
      host: this.emailConfig.host,
      port: this.emailConfig.port,
      secure: this.emailConfig.secure,
      auth: this.emailConfig.auth,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  private loadTemplates(): void {
    // Corrigindo o caminho para apontar para src/templates
    const templatesPath = join(process.cwd(), 'src', 'templates');

    this.logger.log(`Looking for templates in: ${templatesPath}`);

    if (!existsSync(templatesPath)) {
      this.logger.warn(`Templates directory not found at: ${templatesPath}`);
      return;
    }

    const templateFiles = [
      { name: 'welcome', subject: 'Bem-vindo!' },
      { name: 'password-reset', subject: 'Redefinição de Senha' },
      { name: 'notification', subject: 'Notificação' },
    ];

    templateFiles.forEach(({ name, subject }) => {
      try {
        const templatePath = join(templatesPath, `${name}.hbs`);
        this.logger.log(`Checking template at: ${templatePath}`);

        if (existsSync(templatePath)) {
          const htmlTemplate = readFileSync(templatePath, 'utf-8');
          this.templates.set(name, {
            name,
            subject,
            htmlTemplate,
          });
          this.logger.log(`✅ Template '${name}' loaded successfully`);
        } else {
          this.logger.warn(`❌ Template file not found: ${templatePath}`);
        }
      } catch (error) {
        this.logger.error(`Failed to load template '${name}':`, error.message);
      }
    });

    this.logger.log(`Total templates loaded: ${this.templates.size}`);
  }

  async verifyConnection(): Promise<HealthStatus> {
    if (!this.emailConfig) {
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

  async sendEmail(emailData: SendEmailDto): Promise<SendEmailResult> {
    if (!this.emailConfig) {
      throw new BadRequestException(
        'Email service not configured. Check environment variables.',
      );
    }

    if (!this.transporter) {
      throw new BadRequestException('Email transporter not initialized');
    }

    try {
      let html = emailData.html;
      let text = emailData.text;

      // Se um template foi especificado, renderize-o
      if (emailData.template && emailData.templateData) {
        const rendered = await this.renderTemplate(
          emailData.template,
          emailData.templateData,
        );
        html = rendered.html;
        text = rendered.text;
      }

      const mailOptions = {
        from: `"${this.emailConfig.from.name}" <${this.emailConfig.from.email}>`,
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        text,
        html,
        attachments: emailData.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);

      this.logger.log(
        `Email sent successfully to ${emailData.to}. MessageId: ${result.messageId}`,
      );

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${emailData.to}:`,
        error.message,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendTemplateEmail(
    emailData: SendTemplateEmailDto,
  ): Promise<SendEmailResult> {
    const template = this.templates.get(emailData.template);

    if (!template) {
      const availableTemplates = Array.from(this.templates.keys());
      throw new BadRequestException(
        `Template '${emailData.template}' not found. Available templates: ${availableTemplates.join(', ')}`,
      );
    }

    const rendered = await this.renderTemplate(
      emailData.template,
      emailData.data,
    );

    return this.sendEmail({
      to: emailData.to,
      cc: emailData.cc,
      subject: emailData.subject || template.subject,
      html: rendered.html,
      text: rendered.text,
    });
  }

  async sendWelcomeEmail(
    to: string,
    name: string,
    activationUrl?: string,
  ): Promise<SendEmailResult> {
    if (!this.emailConfig) {
      throw new BadRequestException('Email service not configured');
    }

    return this.sendTemplateEmail({
      to,
      template: 'welcome',
      data: {
        name,
        activationUrl,
        companyName: this.emailConfig.from.name,
        year: new Date().getFullYear(),
      },
    });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetUrl: string,
    expirationTime: number = 24,
  ): Promise<SendEmailResult> {
    if (!this.emailConfig) {
      throw new BadRequestException('Email service not configured');
    }

    return this.sendTemplateEmail({
      to,
      template: 'password-reset',
      data: {
        name,
        resetUrl,
        expirationTime,
        companyName: this.emailConfig.from.name,
        year: new Date().getFullYear(),
      },
    });
  }

  async sendNotificationEmail(
    to: string,
    name: string,
    title: string,
    message: string,
    details?: Record<string, any>,
    actionUrl?: string,
    actionText?: string,
  ): Promise<SendEmailResult> {
    if (!this.emailConfig) {
      throw new BadRequestException('Email service not configured');
    }

    return this.sendTemplateEmail({
      to,
      template: 'notification',
      subject: title,
      data: {
        name,
        title,
        message,
        details,
        actionUrl,
        actionText,
        companyName: this.emailConfig.from.name,
        year: new Date().getFullYear(),
      },
    });
  }

  async sendTestEmail(to?: string): Promise<SendEmailResult> {
    if (!this.emailConfig) {
      throw new BadRequestException(
        'Email service not configured. Check environment variables.',
      );
    }

    const recipient = to || this.emailConfig.from.email;

    return this.sendEmail({
      to: recipient,
      subject: 'Teste de email do TDev Toolkit',
      html: `
        <h2>🎉 Email de Teste</h2>
        <p>Se você recebeu este email, o serviço de email está funcionando corretamente!</p>
        <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <p><strong>Servidor:</strong> ${this.emailConfig.host}:${this.emailConfig.port}</p>
        <hr>
        <small>Este é um email automático do TDev Toolkit.</small>
      `,
      text: `
        Email de Teste - TDev Toolkit

        Se você recebeu este email, o serviço de email está funcionando corretamente!

        Data/Hora: ${new Date().toLocaleString('pt-BR')}
        Servidor: ${this.emailConfig.host}:${this.emailConfig.port}

        Este é um email automático do TDev Toolkit.
      `,
    });
  }

  private async renderTemplate(
    templateName: string,
    data: Record<string, any>,
  ): Promise<{ html: string; text?: string }> {
    const template = this.templates.get(templateName);

    if (!template) {
      const availableTemplates = Array.from(this.templates.keys());
      throw new BadRequestException(
        `Template '${templateName}' not found. Available templates: ${availableTemplates.join(', ')}`,
      );
    }

    try {
      const compiledTemplate = handlebars.compile(template.htmlTemplate);
      const html = compiledTemplate(data);

      // Gerar versão em texto simples removendo tags HTML
      const text = html
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      return { html, text };
    } catch (error) {
      this.logger.error(
        `Failed to render template '${templateName}':`,
        error.message,
      );
      throw new BadRequestException(
        `Failed to render template: ${error.message}`,
      );
    }
  }

  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys());
  }

  getTemplateInfo(templateName: string): EmailTemplate | null {
    return this.templates.get(templateName) || null;
  }
}
