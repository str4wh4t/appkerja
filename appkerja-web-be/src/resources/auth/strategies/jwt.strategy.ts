import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service.js';
import { computeUserFullname } from '../../users/user-fullname.util.js';
import { computeNeedsGoogleProfileCompletion } from '../../users/user-needs-google-profile-completion.util.js';
import { RedisService } from '../../../redis/redis.service.js';
import { User } from '../../users/entities/user.entity.js';

/** Prefix kunci Redis: snapshot `findOne` — scope lewat `userRoles` → `userRoleScopes` (bukan langsung dari users/roles). */
const USER_CACHE_KEY = 'user:';
const USER_CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private redisService: RedisService,
  ) {
    const jwtConfig = configService.get<any>('app.jwt');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: any): Promise<User> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const isGoogleOnboardingToken = payload.purpose === 'google_onboarding';
    const canUseInactiveForOnboarding = (statusCode?: string | null) =>
      isGoogleOnboardingToken && statusCode === 'inactive';

    if (this.redisService.isAvailable()) {
      const cacheKey = `${USER_CACHE_KEY}${payload.sub}`;
      const cached = await this.redisService.get<User>(cacheKey);
      if (
        cached?.status?.code === 'active' ||
        canUseInactiveForOnboarding(cached?.status?.code)
      ) {
        const cachedPlain = cached as unknown as Record<string, unknown>;
        const staleSsoCache =
          Boolean((cached as User).googleId?.trim()) &&
          !Object.prototype.hasOwnProperty.call(
            cachedPlain,
            'completedAt',
          );
        if (staleSsoCache) {
          await this.redisService.del(cacheKey);
        } else {
        const cachedUser = this.hydrateDateFields(cached) as User & {
          impersonatedByUserId?: string;
        };
        Object.assign(cachedUser as object, {
          fullname: computeUserFullname(
            cachedUser.firstName,
            cachedUser.lastName,
          ),
          needsGoogleProfileCompletion: computeNeedsGoogleProfileCompletion({
            googleId: cachedUser.googleId,
            completedAt: (cachedUser as User).completedAt,
          }),
        });
        if (payload.impersonatedByUserId) {
          cachedUser.impersonatedByUserId = payload.impersonatedByUserId;
        }
        if (payload.activeRoleCode != null && payload.activeRoleCode !== '') {
          cachedUser.activeRoleCode = String(payload.activeRoleCode);
        } else {
          cachedUser.activeRoleCode = null;
        }
        if (payload.activeTenantId != null && payload.activeTenantId !== '') {
          cachedUser.activeTenantId = String(payload.activeTenantId);
        } else {
          cachedUser.activeTenantId = null;
        }
        if (!Array.isArray((cachedUser as any).tenants)) {
          (cachedUser as any).tenants = [];
        }
        (cachedUser as User & { jwtPurpose?: string | null }).jwtPurpose =
          payload.purpose != null && String(payload.purpose).length > 0
            ? String(payload.purpose)
            : null;
        return cachedUser as User;
        }
      }
    }

    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status?.code !== 'active' && !canUseInactiveForOnboarding(user.status?.code)) {
      throw new UnauthorizedException('User account is not active');
    }

    if (this.redisService.isAvailable()) {
      // user_role_scopes tersimpan di bawah tiap UserRole (baris user_roles), bukan di root User.
      // Getter `fullname` tidak ikut JSON.stringify — set eksplisit agar cache Redis konsisten dengan entity.
      const plain = JSON.parse(JSON.stringify(user)) as Record<string, unknown>;
      plain.fullname = computeUserFullname(user.firstName, user.lastName);
      plain.needsGoogleProfileCompletion =
        computeNeedsGoogleProfileCompletion({
          googleId: user.googleId,
          completedAt: user.completedAt,
        });
      await this.redisService.set(
        `${USER_CACHE_KEY}${user.id}`,
        plain,
        USER_CACHE_TTL_MS,
      );
    }

    const authenticatedUser = user as User & { impersonatedByUserId?: string };
    if (payload.impersonatedByUserId) {
      authenticatedUser.impersonatedByUserId = payload.impersonatedByUserId;
    }
    if (payload.activeRoleCode != null && payload.activeRoleCode !== '') {
      authenticatedUser.activeRoleCode = String(payload.activeRoleCode);
    } else {
      authenticatedUser.activeRoleCode = null;
    }
    if (payload.activeTenantId != null && payload.activeTenantId !== '') {
      authenticatedUser.activeTenantId = String(payload.activeTenantId);
    } else {
      authenticatedUser.activeTenantId = null;
    }
    if (!Array.isArray((authenticatedUser as any).tenants)) {
      (authenticatedUser as any).tenants = [];
    }

    (authenticatedUser as User & { jwtPurpose?: string | null }).jwtPurpose =
      payload.purpose != null && String(payload.purpose).length > 0
        ? String(payload.purpose)
        : null;

    return authenticatedUser as User;
  }

  private hydrateDateFields<T>(value: T): T {
    if (value === null || value === undefined) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.hydrateDateFields(item)) as T;
    }

    if (typeof value !== 'object') {
      return value;
    }

    const record = value as Record<string, unknown>;
    for (const [key, raw] of Object.entries(record)) {
      if (raw === null || raw === undefined) {
        continue;
      }

      // Convert ISO timestamp strings back to Date for GraphQL DateTime serialization.
      if (
        typeof raw === 'string' &&
        /(At|Date)$/i.test(key) &&
        /^\d{4}-\d{2}-\d{2}T/.test(raw)
      ) {
        const parsed = new Date(raw);
        if (!Number.isNaN(parsed.getTime())) {
          record[key] = parsed;
          continue;
        }
      }

      if (typeof raw === 'object') {
        record[key] = this.hydrateDateFields(raw);
      }
    }

    return value;
  }
}
