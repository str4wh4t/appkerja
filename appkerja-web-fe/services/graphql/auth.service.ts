import { gql } from "@apollo/client/core";
import { gqlMutation, gqlQuery } from "./client";

type LoginResponse = {
  authLogin: {
    access_token: string;
    refresh_token: string;
    expires_in: string;
    token_type: string;
    activeRoleCode?: string | null;
    user?: {
      id: string | number;
      fullname?: string | null;
      username: string;
      email: string;
    };
  };
};

type LoginVariables = {
  authLoginInput: {
    usernameOrEmail: string;
    password: string;
  };
};

type RefreshTokenResponse = {
  authRefreshToken: {
    access_token: string;
    refresh_token: string;
    expires_in: string;
    token_type: string;
  };
};

type RefreshTokenVariables = {
  authRefreshTokenInput: {
    refresh_token: string;
  };
};

type UserMeResponse = {
  usersMe: {
    id: string | number;
    fullname?: string | null;
    username?: string | null;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    googleId?: string | null;
    needsGoogleProfileCompletion?: boolean | null;
    activeRoleCode?: string | null;
    activeTenantId?: string | null;
    roles?: Array<{
      code?: string | null;
      permissions?: Array<{ code?: string | null }> | null;
    }> | null;
  };
};

type ActiveTenantResponse = {
  authActiveTenant: {
    id: string;
    code: string;
    name: string;
    address?: string | null;
    description?: string | null;
  } | null;
};

type AuthMyTenantsResponse = {
  authMyTenants: Array<{
    id: string;
    code: string;
    name: string;
  }>;
};

type SetActiveTenantResponse = {
  authSetActiveTenant: {
    access_token: string;
    refresh_token: string;
    expires_in: string;
    token_type: string;
    activeTenantId?: string | null;
    user: {
      id: string;
    };
  };
};

type SetActiveTenantVariables = {
  authSetActiveTenantInput: {
    activeTenantId: string;
  };
};

type AuthSessionRow = {
  id: string;
  deviceName: string;
  deviceType: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  lastSeenAt?: string | null;
  expiresAt: string;
  isCurrent: boolean;
};

type AuthMySessionsResponse = {
  authMySessions: AuthSessionRow[];
};

type AuthRevokeSessionResponse = {
  authRevokeSession: boolean;
};

type AuthRevokeSessionVariables = {
  authRevokeSessionInput: {
    sessionId: string;
  };
};

type AuthRevokeAllSessionsResponse = {
  authRevokeAllSessions: number;
};

type AuthRevokeAllSessionsVariables = {
  authRevokeAllSessionsInput: {
    keepCurrentSession?: boolean;
  };
};

type ImpersonateResponse = {
  usersImpersonate: {
    access_token: string;
    refresh_token: string;
    expires_in: string;
    token_type: string;
    activeRoleCode?: string | null;
    user?: {
      id: string | number;
      fullname?: string | null;
      username?: string | null;
      email?: string | null;
    };
  };
};

type ImpersonateVariables = {
  targetUserId: string;
};

type ExitImpersonateResponse = {
  usersExitImpersonate: {
    access_token: string;
    refresh_token: string;
    expires_in: string;
    token_type: string;
    activeRoleCode?: string | null;
    user?: {
      id: string | number;
      fullname?: string | null;
      username?: string | null;
      email?: string | null;
    };
  };
};

type ExchangeGoogleCodeResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: string;
  token_type: string;
  activeRoleCode?: string | null;
  activeTenantId?: string | null;
  /** Dari REST exchange: `google_onboarding` = wajib halaman lengkapi profil. */
  token_purpose?: string | null;
  user?: {
    id: string | number;
    fullname?: string | null;
    username?: string | null;
    email?: string | null;
  };
};

/**
 * Placeholder login mutation for credential login flow.
 * Align this mutation with backend schema when finalized.
 */
const LOGIN_MUTATION = gql`
  mutation AuthLogin($authLoginInput: AuthLoginInput!) {
    authLogin(authLoginInput: $authLoginInput) {
      access_token
      refresh_token
      expires_in
      token_type
      activeRoleCode
      user {
        id
        fullname
        username
        email
      }
    }
  }
`;

const REFRESH_TOKEN_MUTATION = gql`
  mutation AuthRefreshToken($authRefreshTokenInput: AuthRefreshTokenInput!) {
    authRefreshToken(authRefreshTokenInput: $authRefreshTokenInput) {
      access_token
      refresh_token
      expires_in
      token_type
    }
  }
`;

const USER_ME_QUERY = gql`
  query UserMe {
    usersMe {
      id
      fullname
      username
      email
      firstName
      lastName
      phone
      avatarUrl
      googleId
      needsGoogleProfileCompletion
      activeRoleCode
      activeTenantId
      roles {
        code
        permissions {
          code
        }
      }
    }
  }
`;

const AUTH_COMPLETE_SSO_ONBOARDING_MUTATION = gql`
  mutation AuthCompleteSsoOnboarding(
    $authCompleteSsoOnboardingInput: AuthCompleteSsoOnboardingInput!
  ) {
    authCompleteSsoOnboarding(
      authCompleteSsoOnboardingInput: $authCompleteSsoOnboardingInput
    ) {
      access_token
      refresh_token
      expires_in
      token_type
      activeRoleCode
      activeTenantId
      user {
        id
        fullname
        username
        email
      }
    }
  }
`;

type AuthCompleteSsoOnboardingVariables = {
  authCompleteSsoOnboardingInput: {
    firstName: string;
    lastName?: string | null;
    username: string;
    phone: string;
  };
};

type AuthCompleteSsoOnboardingResponse = {
  authCompleteSsoOnboarding: ExchangeGoogleCodeResponse & {
    user?: ExchangeGoogleCodeResponse["user"];
  };
};

const ACTIVE_TENANT_QUERY = gql`
  query AuthActiveTenant {
    authActiveTenant {
      id
      code
      name
      address
      description
    }
  }
`;

const AUTH_MY_TENANTS_QUERY = gql`
  query AuthMyTenants {
    authMyTenants {
      id
      code
      name
    }
  }
`;

const AUTH_SET_ACTIVE_TENANT_MUTATION = gql`
  mutation AuthSetActiveTenant($authSetActiveTenantInput: AuthSetActiveTenantInput!) {
    authSetActiveTenant(authSetActiveTenantInput: $authSetActiveTenantInput) {
      access_token
      refresh_token
      expires_in
      token_type
      activeTenantId
      user {
        id
      }
    }
  }
`;

const AUTH_MY_SESSIONS_QUERY = gql`
  query AuthMySessions {
    authMySessions {
      id
      deviceName
      deviceType
      ipAddress
      userAgent
      lastSeenAt
      expiresAt
      isCurrent
    }
  }
`;

const AUTH_REVOKE_SESSION_MUTATION = gql`
  mutation AuthRevokeSession($authRevokeSessionInput: AuthRevokeSessionInput!) {
    authRevokeSession(authRevokeSessionInput: $authRevokeSessionInput)
  }
`;

const AUTH_REVOKE_ALL_SESSIONS_MUTATION = gql`
  mutation AuthRevokeAllSessions($authRevokeAllSessionsInput: AuthRevokeAllSessionsInput!) {
    authRevokeAllSessions(authRevokeAllSessionsInput: $authRevokeAllSessionsInput)
  }
`;

type AuthChangePasswordResponse = {
  authChangePassword: boolean;
};

type AuthChangePasswordVariables = {
  authChangePasswordInput: {
    currentPassword: string;
    newPassword: string;
  };
};

const AUTH_CHANGE_PASSWORD_MUTATION = gql`
  mutation AuthChangePassword($authChangePasswordInput: AuthChangePasswordInput!) {
    authChangePassword(authChangePasswordInput: $authChangePasswordInput)
  }
`;

const USERS_IMPERSONATE_MUTATION = gql`
  mutation UsersImpersonate($targetUserId: String!) {
    usersImpersonate(targetUserId: $targetUserId) {
      access_token
      refresh_token
      expires_in
      token_type
      activeRoleCode
      user {
        id
        fullname
        username
        email
      }
    }
  }
`;

const USERS_EXIT_IMPERSONATE_MUTATION = gql`
  mutation UsersExitImpersonate {
    usersExitImpersonate {
      access_token
      refresh_token
      expires_in
      token_type
      activeRoleCode
      user {
        id
        fullname
        username
        email
      }
    }
  }
`;

export const exchangeSsoToken = async (code: string, apiBaseUrl: string) => {
  const endpoint = `${apiBaseUrl.replace(/\/+$/, "")}/auth/exchange-code`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "SSO exchange failed.");
  }
  return payload as ExchangeGoogleCodeResponse;
};

export const loginWithCredentials = async (usernameOrEmail: string, password: string) => {
  return gqlMutation<LoginResponse, LoginVariables>(LOGIN_MUTATION, {
    authLoginInput: {
      usernameOrEmail,
      password,
    },
  });
};

export const refreshAuthToken = async (refreshToken: string) => {
  return gqlMutation<RefreshTokenResponse, RefreshTokenVariables>(REFRESH_TOKEN_MUTATION, {
    authRefreshTokenInput: {
      refresh_token: refreshToken,
    },
  });
};

export const getUserMe = async () => {
  return gqlQuery<UserMeResponse>(USER_ME_QUERY);
};

export const completeSsoOnboarding = async (input: {
  firstName: string;
  lastName?: string | null;
  username: string;
  phone: string;
}) => {
  return gqlMutation<
    AuthCompleteSsoOnboardingResponse,
    AuthCompleteSsoOnboardingVariables
  >(AUTH_COMPLETE_SSO_ONBOARDING_MUTATION, {
    authCompleteSsoOnboardingInput: input,
  });
};

export const getActiveTenant = async () => {
  return gqlQuery<ActiveTenantResponse>(ACTIVE_TENANT_QUERY);
};

export const getAuthMyTenants = async () => {
  return gqlQuery<AuthMyTenantsResponse>(AUTH_MY_TENANTS_QUERY);
};

export const setActiveTenant = async (activeTenantId: string) => {
  return gqlMutation<SetActiveTenantResponse, SetActiveTenantVariables>(
    AUTH_SET_ACTIVE_TENANT_MUTATION,
    { authSetActiveTenantInput: { activeTenantId } },
  );
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  return gqlMutation<AuthChangePasswordResponse, AuthChangePasswordVariables>(
    AUTH_CHANGE_PASSWORD_MUTATION,
    {
      authChangePasswordInput: {
        currentPassword,
        newPassword,
      },
    },
  );
};

export const getMySessions = async () => {
  return gqlQuery<AuthMySessionsResponse>(AUTH_MY_SESSIONS_QUERY);
};

export const revokeSession = async (sessionId: string) => {
  return gqlMutation<AuthRevokeSessionResponse, AuthRevokeSessionVariables>(
    AUTH_REVOKE_SESSION_MUTATION,
    {
      authRevokeSessionInput: { sessionId },
    },
  );
};

export const revokeAllSessions = async (keepCurrentSession = true) => {
  return gqlMutation<AuthRevokeAllSessionsResponse, AuthRevokeAllSessionsVariables>(
    AUTH_REVOKE_ALL_SESSIONS_MUTATION,
    {
      authRevokeAllSessionsInput: { keepCurrentSession },
    },
  );
};

export const impersonateUser = async (targetUserId: string) => {
  return gqlMutation<ImpersonateResponse, ImpersonateVariables>(
    USERS_IMPERSONATE_MUTATION,
    { targetUserId },
  );
};

export const exitImpersonateUser = async () => {
  return gqlMutation<ExitImpersonateResponse>(USERS_EXIT_IMPERSONATE_MUTATION);
};
