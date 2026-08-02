import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './chat-message.entity';
import { AuditLog } from '../audit/audit-log.entity';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, AuditLog]), AuthModule],
  providers: [CommunityService],
  controllers: [CommunityController],
})
export class CommunityModule {}
