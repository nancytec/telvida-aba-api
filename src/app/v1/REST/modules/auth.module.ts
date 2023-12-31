import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '../controllers/auth/auth.controller';
import { AuthService } from '../services/auth/auth.service';
import { JwtStrategy } from '../strategies/auth/jwt.strategy';
import { LocalStrategy } from '../strategies/auth/local.strategy';
import {UserModule} from "./user.module";
import {DatabaseModule} from "@libs/database/database.module";
import { RefreshTokenStrategy } from "@app/v1/REST/strategies/auth/refresh-token.strategy";
import { AuthEmailService } from "@libs/mail/auth-email/auth-email.service";
import { EmailEngineModule } from "@libs/mail/email-engine/email-engine.module";

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    EmailEngineModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthEmailService, LocalStrategy, JwtStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
