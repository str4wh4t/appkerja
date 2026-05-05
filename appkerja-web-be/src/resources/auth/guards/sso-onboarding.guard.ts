import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity.js';

const ALLOWED_ROOT_FIELDS = new Set([
  'usersMe',
  'authCompleteSsoOnboarding',
]);

/**
 * Membatasi GraphQL ke endpoint onboarding jika JWT punya claim purpose=google_onboarding.
 */
@Injectable()
export class SsoOnboardingGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if ((context.getType() as string) !== 'graphql') {
      return true;
    }

    const gqlCtx = GqlExecutionContext.create(context);
    const info = gqlCtx.getInfo();
    const fieldName = info.fieldName as string;

    if (fieldName.startsWith('__')) {
      return true;
    }

    const parentType = info.parentType?.name;
    if (parentType !== 'Query' && parentType !== 'Mutation') {
      return true;
    }

    const graphqlContext = gqlCtx.getContext();
    const request = graphqlContext.req || graphqlContext.request;
    const user = request?.user as (User & { jwtPurpose?: string | null }) | undefined;
    if (!user) {
      return true;
    }

    if (user.jwtPurpose !== 'google_onboarding') {
      return true;
    }

    if (ALLOWED_ROOT_FIELDS.has(fieldName)) {
      return true;
    }

    throw new ForbiddenException(
      'Selesaikan pengaturan profil SSO (telepon + username) sebelum melanjutkan.',
    );
  }
}
