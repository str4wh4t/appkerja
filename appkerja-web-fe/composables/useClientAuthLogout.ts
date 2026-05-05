import { revokeSession } from "@/services/graphql/auth.service";

/**
 * Hapus token sesi di browser lalu ke halaman login (sama logika tombol Logout di header).
 */
export function useClientAuthLogout() {
  const router = useRouter();

  const getSessionIdFromToken = (token: string | null): string | null => {
    const raw = String(token || "").trim();
    if (!raw) return null;
    try {
      const payloadPart = raw.split(".")[1];
      if (!payloadPart) return null;
      const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized.padEnd(
        normalized.length + ((4 - (normalized.length % 4)) % 4),
        "=",
      );
      const payload = JSON.parse(atob(padded)) as { sid?: string | null };
      const sid = String(payload?.sid || "").trim();
      return sid || null;
    } catch {
      return null;
    }
  };

  async function logoutClient() {
    if (import.meta.client) {
      const accessToken = localStorage.getItem("accessToken");
      const currentSessionId = getSessionIdFromToken(accessToken);
      if (currentSessionId) {
        try {
          await revokeSession(currentSessionId);
        } catch {
          // Best effort: always continue with local logout.
        }
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("tokenPurpose");
    }
    await router.push("/auth/login");
  }

  return { logoutClient };
}
