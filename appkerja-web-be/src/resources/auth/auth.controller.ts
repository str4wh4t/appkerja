import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { Public } from './decorators/index.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get(':tenantId/google')
  async googleLogin(
    @Res() res: FastifyReply,
    @Param('tenantId') tenantId: string,
  ) {
    const authUrl = await this.authService.getGoogleAuthorizationUrl(tenantId);
    return res.redirect(authUrl, 302);
  }

  @Public()
  @Get('google')
  async googleLoginDefault(@Res() res: FastifyReply) {
    const authUrl = await this.authService.getGoogleAuthorizationUrl();
    return res.redirect(authUrl, 302);
  }

  @Public()
  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Res() res: FastifyReply,
  ) {
    try {
      if (error) {
        throw new Error(errorDescription || error);
      }
      if (!code) {
        throw new Error('Authorization code not provided');
      }

      const { user, tenantId } = await this.authService.handleGoogleCallback(
        code,
        state,
      );
      const oneTimeCode = await this.authService.createGoogleLoginExchangeCode(
        user,
        tenantId,
      );

      const frontendUrl = this.configService.get<string>('FRONTEND_URL_LOGIN');
      if (!frontendUrl) {
        throw new Error('FRONTEND_URL_LOGIN is not configured');
      }

      const redirectUrl = new URL(frontendUrl);
      redirectUrl.searchParams.set('success', 'true');
      redirectUrl.searchParams.set('code', oneTimeCode);
      redirectUrl.searchParams.set('tenantId', tenantId);
      return res.redirect(redirectUrl.toString(), 302);
    } catch (err: any) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL_LOGIN');
      if (frontendUrl) {
        const redirectUrl = new URL(frontendUrl);
        redirectUrl.searchParams.set('success', 'false');
        redirectUrl.searchParams.set('error', err.message || 'Google login failed');
        return res.redirect(redirectUrl.toString(), 302);
      }
      res.status(400).send({
        success: false,
        message: 'Google login callback failed',
        error: err.message,
      });
    }
  }

  @Public()
  @Post('google/exchange-code')
  async googleExchangeCode(@Body('code') code: string) {
    return this.authService.exchangeGoogleLoginCode(code);
  }

  @Public()
  @Post('exchange-code')
  async exchangeCode(@Body('code') code: string) {
    return this.authService.exchangeGoogleLoginCode(code);
  }
}

