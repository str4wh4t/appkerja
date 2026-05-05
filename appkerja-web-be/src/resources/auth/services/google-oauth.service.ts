import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type GoogleTokenResponse = {
  access_token: string;
  id_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
};

type GoogleUserInfo = {
  sub: string;
  email: string;
  email_verified: boolean;
  given_name?: string;
  family_name?: string;
  name?: string;
  /** URL foto profil (HTTPS), dari scope `profile`. */
  picture?: string;
};

@Injectable()
export class GoogleOauthService {
  constructor(private readonly configService: ConfigService) {}

  getAuthUrl(state?: string): string {
    const clientId = this.configService.get<string>('app.google.clientId');
    const redirectUri = this.configService.get<string>('app.google.redirectUri');

    if (!clientId || !redirectUri) {
      throw new UnauthorizedException(
        'Google OAuth belum terkonfigurasi (clientId/redirectUri).',
      );
    }

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('access_type', 'online');
    authUrl.searchParams.set('prompt', 'select_account');
    if (state) authUrl.searchParams.set('state', state);
    return authUrl.toString();
  }

  async exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
    const clientId = this.configService.get<string>('app.google.clientId');
    const clientSecret = this.configService.get<string>('app.google.clientSecret');
    const redirectUri = this.configService.get<string>('app.google.redirectUri');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new UnauthorizedException(
        'Google OAuth belum terkonfigurasi (clientId/clientSecret/redirectUri).',
      );
    }

    const tokenEndpoint = 'https://oauth2.googleapis.com/token';
    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new UnauthorizedException('Gagal menukar authorization code Google.');
    }

    return (await response.json()) as GoogleTokenResponse;
  }

  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Gagal mengambil profil user Google.');
    }

    const data = (await response.json()) as GoogleUserInfo;
    if (!data.sub || !data.email) {
      throw new UnauthorizedException('Profil Google tidak valid.');
    }
    return data;
  }
}

