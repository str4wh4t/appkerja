/**
 * Sama dengan logika getter `User.needsGoogleProfileCompletion` — dipakai ulang
 * saat serialisasi/hidrasi cache Redis (objek plain tanpa prototype `User`).
 */
export function computeNeedsGoogleProfileCompletion(input: {
  googleId?: string | null;
  completedAt?: unknown;
}): boolean {
  const gid =
    typeof input.googleId === 'string' ? input.googleId.trim() : '';
  return Boolean(gid) && input.completedAt == null;
}
