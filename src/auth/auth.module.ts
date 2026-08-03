import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { ElevatedSession } from './elevated-session.entity';
import { AuditLog } from '../audit/audit-log.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ElevatedSession, AuditLog]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET, // NUNCA hardcodear — ver .env.example
        signOptions: { expiresIn: '2h' },
      }),
    }),
  ],
  providers: [AuthService, JwtAuthGuard],
  controllers: [AuthController],
  // TypeOrmModule se re-exporta para que los guards (JwtAuthGuard usa
  // UserRepository, ElevationGuard usa ElevatedSessionRepository) resuelvan
  // sus dependencias en el contexto del módulo que los referencia.
  exports: [AuthService, JwtAuthGuard, JwtModule, TypeOrmModule],
})
export class AuthModule {}
