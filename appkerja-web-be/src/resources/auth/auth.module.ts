import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { AuthQuery, AuthMutation } from './resolvers/index.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { UsersModule } from '../users/users.module.js';
import { GoogleOauthService } from './services/index.js';
import { Tenant, UserTenant } from '../tenants/entities/index.js';
import { Role } from '../roles/entities/role.entity.js';
import { AuthSession } from './entities/index.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const jwtConfig = configService.get<any>('app.jwt');
        return {
          secret: jwtConfig.secret,
          signOptions: {
            expiresIn: jwtConfig.expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Tenant, UserTenant, Role, AuthSession]),
    UsersModule,
  ],
  providers: [
    AuthService,
    AuthQuery,
    AuthMutation,
    GoogleOauthService,
    JwtStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
