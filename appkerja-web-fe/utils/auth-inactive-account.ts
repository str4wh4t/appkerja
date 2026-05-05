/** Matches backend `UnauthorizedException` messages for inactive account status. */
export const INACTIVE_ACCOUNT_MESSAGE_RE =
  /account is not active|user account is not active|not active/i;

export function messageIndicatesInactiveAccount(message: unknown): boolean {
  return INACTIVE_ACCOUNT_MESSAGE_RE.test(String(message ?? ""));
}

/** Check `GraphQLServiceError.errors` or the top-level message. */
export function loginErrorIndicatesInactiveAccount(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const anyErr = error as { message?: string; errors?: Array<{ message?: string }> };
  if (messageIndicatesInactiveAccount(anyErr.message)) return true;
  const list = anyErr.errors;
  if (!Array.isArray(list)) return false;
  return list.some((e) => messageIndicatesInactiveAccount(e?.message));
}

export function graphQLErrorPayloadIndicatesInactiveAccount(
  graphQLErrors?: readonly { message?: string }[] | null,
  networkError?: unknown,
): boolean {
  const parts: string[] = [];
  for (const e of graphQLErrors ?? []) {
    parts.push(String(e?.message ?? ""));
  }
  const ne = networkError as {
    result?: { errors?: Array<{ message?: string }> };
    message?: string;
  } | null;
  for (const e of ne?.result?.errors ?? []) {
    parts.push(String(e?.message ?? ""));
  }
  if (ne?.message) parts.push(String(ne.message));
  return INACTIVE_ACCOUNT_MESSAGE_RE.test(parts.join(" "));
}

/** Client-only: clear session then open inactive page (avoid redirect loop on same route). */
export function redirectToAuthInactiveAccountPage(): void {
  if (!import.meta.client || typeof window === "undefined") return;
  if (window.location.pathname.includes("/auth/inactive")) return;
  localStorage.removeItem("accessToken");
  sessionStorage.removeItem("tokenPurpose");
  localStorage.removeItem("refreshToken");
  window.location.assign("/auth/inactive");
}
