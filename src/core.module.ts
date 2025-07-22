import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreController } from './core.controller';
import { CoreService } from './core.service';
import { HealthUtils } from './utils/health.utils';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { PaymentModule } from './payment/payment.module';
import { WebhookModule } from './payment/webhooks/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    EmailModule,
    PaymentModule,
    WebhookModule,
  ],
  controllers: [CoreController],
  providers: [CoreService, HealthUtils],
})
export class CoreModule {}
