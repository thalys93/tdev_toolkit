import { Controller, Get, HttpException } from '@nestjs/common';
import { CoreService } from './core.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ApiResponse as StandardApiResponse,
  ApiResponseBuilder,
  API_KEYS,
  API_STATUS,
} from './utils/api-response.interface';

@ApiTags('Core Module')
@Controller()
export class CoreController {
  constructor(private readonly appService: CoreService) {}

  @Get('/system-check')
  @ApiOperation({ summary: 'Verificar status geral do sistema' })
  @ApiResponse({ status: 200, description: 'Status do sistema verificado' })
  async systemCheck(): Promise<StandardApiResponse<any>> {
    try {
      const systemStatus = await this.appService.systemCheck();
      return ApiResponseBuilder.success(
        systemStatus,
        API_STATUS.SUCCESS,
        200,
        API_KEYS.CORE.SYSTEM_CHECK,
        'Status do sistema verificado com sucesso',
      );
    } catch (error) {
      throw new HttpException(
        ApiResponseBuilder.error(
          'Falha ao verificar status do sistema',
          API_STATUS.ERROR,
          500,
          API_KEYS.CORE.SYSTEM_CHECK,
          error.message,
          error,
        ),
        500,
      );
    }
  }

  // @Get('cloudinary-signature')
  // @ApiOperation({ summary: 'Gerar assinatura do Cloudinary' })
  // @ApiResponse({ status: 200, description: 'Assinatura gerada com sucesso' })
  // async getCloudinarySignature(
  //   @Query('id') id: string
  // ): Promise<StandardApiResponse<any>> {
  //   try {
  //     const signature = await this.appService.generateCloudinarySignature(id);
  //     return ApiResponseBuilder.success(
  //       signature,
  //       API_STATUS.SUCCESS,
  //       200,
  //       API_KEYS.CORE.CLOUDINARY_SIGNATURE,
  //       'Assinatura do Cloudinary gerada com sucesso',
  //     );
  //   } catch (error) {
  //     throw new HttpException(
  //       ApiResponseBuilder.error(
  //         'Falha ao gerar assinatura do Cloudinary',
  //         API_STATUS.ERROR,
  //         500,
  //         API_KEYS.CORE.CLOUDINARY_SIGNATURE,
  //         error.message,
  //         error,
  //       ),
  //       500,
  //     );
  //   }
  // }
}
