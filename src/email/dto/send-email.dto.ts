import {
  IsEmail,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmailAttachmentDto {
  @ApiProperty({ description: 'Nome do arquivo' })
  @IsString()
  filename: string;

  @ApiPropertyOptional({ description: 'Caminho do arquivo' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ description: 'Tipo de conteúdo' })
  @IsOptional()
  @IsString()
  contentType?: string;
}

export class SendEmailDto {
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

  @ApiPropertyOptional({
    description: 'Emails em cópia oculta',
    type: [String],
    example: ['bcc1@example.com'],
  })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  bcc?: string[];

  @ApiProperty({ description: 'Assunto do email', example: 'Assunto do email' })
  @IsString()
  subject: string;

  @ApiPropertyOptional({ description: 'Conteúdo em texto simples' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ description: 'Conteúdo em HTML' })
  @IsOptional()
  @IsString()
  html?: string;

  @ApiPropertyOptional({ description: 'Nome do template a ser usado' })
  @IsOptional()
  @IsString()
  template?: string;

  @ApiPropertyOptional({
    description: 'Variáveis para o template',
    type: 'object',
    example: { name: 'João', company: 'Empresa XYZ' },
  })
  @IsOptional()
  @IsObject()
  templateData?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Anexos do email',
    type: [EmailAttachmentDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailAttachmentDto)
  attachments?: EmailAttachmentDto[];
}
