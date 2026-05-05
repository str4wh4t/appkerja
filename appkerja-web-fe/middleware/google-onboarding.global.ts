/**
 * Saat tokenPurpose=google_onboarding, paksa user ke halaman lengkapi profil SSO,
 * kecuali halaman onboarding itu sendiri dan halaman login (ganti akun / masuk lagi).
 */
export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return;

  const purpose = sessionStorage.getItem("tokenPurpose");
  if (purpose !== "google_onboarding") return;

  const path = to.path;
  if (path === "/auth/complete-google-profile" || path.startsWith("/auth/complete-google-profile/")) {
    return;
  }

  if (path === "/auth/login" || path.startsWith("/auth/login/")) {
    return;
  }

  return navigateTo({
    path: "/auth/complete-google-profile",
    query: { redirect: to.fullPath },
  });
});
