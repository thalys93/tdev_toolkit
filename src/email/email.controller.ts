import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { HealthStatus } from 'src/utils/health.utils';
import { SendEmailDto, SendTemplateEmailDto } from './dto';
import { SendEmailResult } from './interfaces';
import {
  ApiResponse as StandardApiResponse,
  ApiResponseBuilder,
  API_KEYS,
  API_STATUS,
} from '../utils/api-response.interface';

@ApiTags('Email Module')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('health')
  @ApiOperation({ summary: 'Verificar status do serviço de email' })
  @ApiResponse({ status: 200, description: 'Status do serviço' })
  async checkHealth(): Promise<StandardApiResponse<HealthStatus>> {
    try {
      const healthStatus = await this.emailService.verifyConnection();
      return ApiResponseBuilder.success(
        healthStatus,
        API_STATUS.SUCCESS,
        200,
        API_KEYS.EMAIL.HEALTH,
        'Status do serviço de email verificado com sucesso',
      );
    } catch (error) {
      throw new HttpException(
        ApiResponseBuilder.error(
          'Falha ao verificar status do serviço',
          API_STATUS.ERROR,
          500,
          API_KEYS.EMAIL.HEALTH,
          error.message,
          error,
        ),
        500,
      );
    }
  }

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar email personalizado' })
  @ApiResponse({ status: 200, description: 'Email enviado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async sendEmail(
    @Body() emailData: SendEmailDto,
  ): Promise<StandardApiResponse<SendEmailResult>> {
    try {
      const result = await this.emailService.sendEmail(emailData);
      return ApiResponseBuilder.success(
        result,
        API_STATUS.SUCCESS,
        200,
        API_KEYS.EMAIL.SEND,
        'Email enviado com sucesso',
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException(
          ApiResponseBuilder.error(
            'Dados inválidos para envio de email',
            API_STATUS.VALIDATION_ERROR,
            400,
            API_KEYS.EMAIL.SEND,
            error.message,
            error,
          ),
          400,
        );
      }
      throw new HttpException(
        ApiResponseBuilder.error(
          'Falha ao enviar email',
          API_STATUS.ERROR,
          500,
          API_KEYS.EMAIL.SEND,
          error.message,
          error,
        ),
        500,
      );
    }
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
  ): Promise<StandardApiResponse<SendEmailResult>> {
    try {
      const result = await this.emailService.sendTemplateEmail(emailData);
      return ApiResponseBuilder.success(
        result,
        API_STATUS.SUCCESS,
        200,
        API_KEYS.EMAIL.SEND_TEMPLATE,
        'Email com template enviado com sucesso',
      );
    } catch (error) {
      if (error.message.includes('Template not found')) {
        throw new HttpException(
          ApiResponseBuilder.error(
            'Template não encontrado',
            API_STATUS.NOT_FOUND,
            404,
            API_KEYS.EMAIL.SEND_TEMPLATE,
            error.message,
            error,
          ),
          404,
        );
      }
      if (error instanceof BadRequestException) {
        throw new HttpException(
          ApiResponseBuilder.error(
            'Dados inválidos para envio de email com template',
            API_STATUS.VALIDATION_ERROR,
            400,
            API_KEYS.EMAIL.SEND_TEMPLATE,
            error.message,
            error,
          ),
          400,
        );
      }
      throw new HttpException(
        ApiResponseBuilder.error(
          'Falha ao enviar email com template',
          API_STATUS.ERROR,
          500,
          API_KEYS.EMAIL.SEND_TEMPLATE,
          error.message,
          error,
        ),
        500,
      );
    }
  }

  @Post('send-welcome')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar email de boas-vindas' })
  @ApiResponse({ status: 200, description: 'Email de boas-vindas enviado' })
  async sendWelcomeEmail(
    @Body() data: { to: string; name: string; activationUrl?: string },
  ): Promise<StandardApiResponse<SendEmailResult>> {
    try {
      const result = await this.emailService.sendWelcomeEmail(
        data.to,
        data.name,
        data.activationUrl,
      );
      return ApiResponseBuilder.success(
        result,
        API_STATUS.SUCCESS,
        200,
        API_KEYS.EMAIL.SEND_WELCOME,
        'Email de boas-vindas enviado com sucesso',
      );
    } catch (error) {
      throw new HttpException(
        ApiResponseBuilder.error(
          'Falha ao enviar email de boas-vindas',
          API_STATUS.ERROR,
          500,
          API_KEYS.EMAIL.SEND_WELCOME,
          error.message,
          error,
        ),
        500,
      );
    }
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
  ): Promise<StandardApiResponse<SendEmailResult>> {
    try {
      const result = await this.emailService.sendPasswordResetEmail(
        data.to,
        data.name,
        data.resetUrl,
        data.expirationTime,
      );
      return ApiResponseBuilder.success(
        result,
        API_STATUS.SUCCESS,
        200,
        API_KEYS.EMAIL.SEND_PASSWORD_RESET,
        'Email de redefinição de senha enviado com sucesso',
      );
    } catch (error) {
      throw new HttpException(
        ApiResponseBuilder.error(
          'Falha ao enviar email de redefinição de senha',
          API_STATUS.ERROR,
          500,
          API_KEYS.EMAIL.SEND_PASSWORD_RESET,
          error.message,
          error,
        ),
        500,
      );
    }
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
  ): Promise<StandardApiResponse<SendEmailResult>> {
    try {
      const result = await this.emailService.sendNotificationEmail(
        data.to,
        data.name,
        data.title,
        data.message,
        data.details,
        data.actionUrl,
        data.actionText,
      );
      return ApiResponseBuilder.success(
        result,
        API_STATUS.SUCCESS,
        200,
        API_KEYS.EMAIL.SEND_NOTIFICATION,
        'Email de notificação enviado com sucesso',
      );
    } catch (error) {
      throw new HttpException(
        ApiResponseBuilder.error(
          'Falha ao enviar email de notificação',
          API_STATUS.ERROR,
          500,
          API_KEYS.EMAIL.SEND_NOTIFICATION,
          error.message,
          error,
        ),
        500,
      );
    }
  }

  @Get('send-test')
  @ApiOperation({ summary: 'Enviar email de teste' })
  @ApiResponse({ status: 200, description: 'Email de teste enviado' })
  async sendTestEmail(
    @Query('to') to?: string,
  ): Promise<StandardApiResponse<SendEmailResult>> {
    try {
      const result = await this.emailService.sendTestEmail(to);
      return ApiResponseBuilder.success(
        result,
        API_STATUS.SUCCESS,
        200,
        API_KEYS.EMAIL.SEND_TEST,
        'Email de teste enviado com sucesso',
      );
    } catch (error) {
      throw new HttpException(
        ApiResponseBuilder.error(
          'Falha ao enviar email de teste',
          API_STATUS.ERROR,
          500,
          API_KEYS.EMAIL.SEND_TEST,
          error.message,
          error,
        ),
        500,
      );
    }
  }

  @Get('templates')
  @ApiOperation({ summary: 'Listar templates disponíveis' })
  @ApiResponse({ status: 200, description: 'Lista de templates' })
  async getAvailableTemplates(): Promise<
    StandardApiResponse<{ templates: string[] }>
  > {
    try {
      const templates = this.emailService.getAvailableTemplates();
      return ApiResponseBuilder.success(
        { templates },
        API_STATUS.SUCCESS,
        200,
        API_KEYS.EMAIL.GET_TEMPLATES,
        'Templates listados com sucesso',
      );
    } catch (error) {
      throw new HttpException(
        ApiResponseBuilder.error(
          'Falha ao listar templates',
          API_STATUS.ERROR,
          500,
          API_KEYS.EMAIL.GET_TEMPLATES,
          error.message,
          error,
        ),
        500,
      );
    }
  }

  @Get('templates/:name')
  @ApiOperation({ summary: 'Obter informações de um template específico' })
  @ApiResponse({ status: 200, description: 'Informações do template' })
  @ApiResponse({ status: 404, description: 'Template não encontrado' })
  async getTemplateInfo(@Param('name') name: string): Promise<
    StandardApiResponse<{
      name: string;
      subject: string;
      hasHtmlTemplate: boolean;
      hasTextTemplate: boolean;
    }>
  > {
    try {
      const template = this.emailService.getTemplateInfo(name);
      if (!template) {
        throw new HttpException(
          ApiResponseBuilder.error(
            'Template não encontrado',
            API_STATUS.NOT_FOUND,
            404,
            API_KEYS.EMAIL.GET_TEMPLATE_INFO,
            `Template '${name}' não foi encontrado`,
          ),
          404,
        );
      }

      const templateInfo = {
        name: template.name,
        subject: template.subject,
        hasHtmlTemplate: !!template.htmlTemplate,
        hasTextTemplate: !!template.textTemplate,
      };

      return ApiResponseBuilder.success(
        templateInfo,
        API_STATUS.SUCCESS,
        200,
        API_KEYS.EMAIL.GET_TEMPLATE_INFO,
        'Informações do template obtidas com sucesso',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        ApiResponseBuilder.error(
          'Falha ao obter informações do template',
          API_STATUS.ERROR,
          500,
          API_KEYS.EMAIL.GET_TEMPLATE_INFO,
          error.message,
          error,
        ),
        500,
      );
    }
  }
}
