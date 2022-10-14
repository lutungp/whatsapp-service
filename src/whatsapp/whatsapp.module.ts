import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { AppGateway } from 'src/app.gateway';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';

@Module({
  providers: [
    WhatsappService, 
    AppGateway
  ],
  imports: [
    ConfigModule.forRoot({
      load: [configuration]
    }),
    HttpModule
  ],
  controllers: [WhatsappController]
})
export class WhatsappModule {}
