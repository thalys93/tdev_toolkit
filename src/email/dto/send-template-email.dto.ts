import {
  IsEmail,
  IsString,
  IsObject,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendTemplateEmailDto {
  @ApiProperty({
    description: 'Email do destinatário',
    example: 'user@example.com',
  })
  @IsEmail()
  to: string;

  @ApiPropertyOptional({
    description: 'Emails adicionais em cópia',
    type: [String],
    example: ['cc1@example.com', 'cc2@example.com'],
  })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @ApiProperty({
    description: 'Nome do template',
    example: 'welcome',
  })
  @IsString()
  template: string;

  @ApiProperty({
    description: 'Dados para o template',
    type: 'object',
    example: {
      name: 'João Silva',
      activationUrl: 'https://example.com/activate',
      companyName: 'TDev Toolkit',
    },
  })
  @IsObject()
  data: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Assunto personalizado (sobrescreve o do template)',
    example: 'Bem-vindo ao nosso sistema!',
  })
  @IsOptional()
  @IsString()
  subject?: string;
}
