import { Module } from '@nestjs/common';
import { UserModule } from '../users/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenProvider } from './access-token.provider';
import { RefreshTokenProvider } from './refresh-token.provider';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    UserModule,
    RedisModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('AUTH_JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('AUTH_ACCESS_EXPIRES'),
          issuer: configService.get('AUTH_JWT_ISSUER'),
          keyid: String(configService.get('AUTH_JWT_KEY_ID')),
          algorithm: configService.get('AUTH_JWT_ALGORITHM'),
        },
      }),
    }),
  ],
  providers: [AuthService, AccessTokenProvider, RefreshTokenProvider],
  controllers: [AuthController],
})
export class AuthModule {}
