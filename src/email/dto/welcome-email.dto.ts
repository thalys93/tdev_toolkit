import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WelcomeEmailDto {
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

  @ApiPropertyOptional({
    description: 'URL de ativação da conta',
    example: 'https://example.com/activate?token=abc123',
  })
  @IsOptional()
  @IsString()
  activationUrl?: string;
}
