import { IsEmail, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationEmailDto {
  @ApiProperty({
    description: 'Email do destinatário',
    example: 'user@example.com',
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João Silva',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Título da notificação',
    example: 'Nova mensagem recebida',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Mensagem da notificação',
    example: 'Você recebeu uma nova mensagem no sistema.',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: 'Detalhes adicionais',
    type: 'object',
    example: {
      sender: 'Maria Silva',
      date: '2024-01-15',
      priority: 'high',
    },
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'URL de ação',
    example: 'https://example.com/messages/123',
  })
  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiPropertyOptional({
    description: 'Texto do botão de ação',
    example: 'Ver mensagem',
  })
  @IsOptional()
  @IsString()
  actionText?: string;
}
