import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { HealthStatus } from 'src/utils/health.utils';
import { SendEmailDto, SendTemplateEmailDto } from './dto';
import { SendEmailResult } from './interfaces';

@ApiTags('Email Module')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('health')
  @ApiOperation({ summary: 'Verificar status do serviço de email' })
  @ApiResponse({ status: 200, description: 'Status do serviço' })
  async checkHealth(): Promise<HealthStatus> {
    return this.emailService.verifyConnection();
  }

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar email personalizado' })
  @ApiResponse({ status: 200, description: 'Email enviado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async sendEmail(@Body() emailData: SendEmailDto): Promise<SendEmailResult> {
    return this.emailService.sendEmail(emailData);
  }

  @Post('send-template')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar email usando template' })
  @ApiResponse({ status: 200, description: 'Email enviado com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Template não encontrado ou dados inválidos',
  })
  async sendTemplateEmail(
    @Body() emailData: SendTemplateEmailDto,
  ): Promise<SendEmailResult> {
    return this.emailService.sendTemplateEmail(emailData);
  }

  @Post('send-welcome')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar email de boas-vindas' })
  @ApiResponse({ status: 200, description: 'Email de boas-vindas enviado' })
  async sendWelcomeEmail(
    @Body() data: { to: string; name: string; activationUrl?: string },
  ): Promise<SendEmailResult> {
    return this.emailService.sendWelcomeEmail(
      data.to,
      data.name,
      data.activationUrl,
    );
  }

  @Post('send-password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar email de redefinição de senha' })
  @ApiResponse({ status: 200, description: 'Email de redefinição enviado' })
  async sendPasswordResetEmail(
    @Body()
    data: {
      to: string;
      name: string;
      resetUrl: string;
      expirationTime?: number;
    },
  ): Promise<SendEmailResult> {
    return this.emailService.sendPasswordResetEmail(
      data.to,
      data.name,
      data.resetUrl,
      data.expirationTime,
    );
  }

  @Post('send-notification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar email de notificação' })
  @ApiResponse({ status: 200, description: 'Email de notificação enviado' })
  async sendNotificationEmail(
    @Body()
    data: {
      to: string;
      name: string;
      title: string;
      message: string;
      details?: Record<string, any>;
      actionUrl?: string;
      actionText?: string;
    },
  ): Promise<SendEmailResult> {
    return this.emailService.sendNotificationEmail(
      data.to,
      data.name,
      data.title,
      data.message,
      data.details,
      data.actionUrl,
      data.actionText,
    );
  }

  @Get('send-test')
  @ApiOperation({ summary: 'Enviar email de teste' })
  @ApiResponse({ status: 200, description: 'Email de teste enviado' })
  async sendTestEmail(@Query('to') to?: string): Promise<SendEmailResult> {
    return this.emailService.sendTestEmail(to);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Listar templates disponíveis' })
  @ApiResponse({ status: 200, description: 'Lista de templates' })
  async getAvailableTemplates(): Promise<{ templates: string[] }> {
    const templates = this.emailService.getAvailableTemplates();
    return { templates };
  }

  @Get('templates/:name')
  @ApiOperation({ summary: 'Obter informações de um template específico' })
  @ApiResponse({ status: 200, description: 'Informações do template' })
  @ApiResponse({ status: 404, description: 'Template não encontrado' })
  async getTemplateInfo(@Param('name') name: string) {
    const template = this.emailService.getTemplateInfo(name);
    if (!template) {
      return { error: 'Template not found' };
    }
    return {
      name: template.name,
      subject: template.subject,
      hasHtmlTemplate: !!template.htmlTemplate,
      hasTextTemplate: !!template.textTemplate,
    };
  }
}
