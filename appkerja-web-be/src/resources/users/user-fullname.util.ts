/**
 * Nama lengkap tampilan (satu sumber kebenaran untuk getter User dan serialisasi cache JWT/Redis).
 */
export function computeUserFullname(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string | null {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`.trim();
  }
  return firstName || lastName || null;
}
