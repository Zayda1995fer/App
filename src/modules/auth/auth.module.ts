import { Module }     from '@nestjs/common';
import { JwtModule }  from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService }    from './auth.service';
import { PrismaService }  from 'src/prisma.service';
import { AuditModule }    from '../audit/audit.module';

@Module({
  imports: [
    // JWT_SECRET cargado desde .env — nunca hardcodeado
    JwtModule.register({
      secret:       process.env.JWT_SECRET || 'fallback_key_cambiar_en_produccion',
      signOptions:  { expiresIn: '60s' },
    }),
    AuditModule,
  ],
  controllers: [AuthController],
  providers:   [AuthService, PrismaService],
  exports:     [JwtModule],
})
export class AuthModule {}