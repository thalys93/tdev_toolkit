import { Controller, Get } from '@nestjs/common';
import { CoreService } from './core.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Core Module')
@Controller()
export class CoreController {
  constructor(private readonly appService: CoreService) {}

  @Get('/system-check')
  async systemCheck() {
    return this.appService.systemCheck();
  }

  // @Get('cloudinary-signature')
  // async getCloudinarySignature(@Query('id') id: string) {
  //   return this.appService.generateCloudinarySignature(id);
  // }
}
