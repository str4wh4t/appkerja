/**
 * Hapus token sesi di browser lalu ke halaman login (sama logika tombol Logout di header).
 */
export function useClientAuthLogout() {
  const router = useRouter();

  async function logoutClient() {
    if (import.meta.client) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("tokenPurpose");
    }
    await router.push("/auth/login");
  }

  return { logoutClient };
}
