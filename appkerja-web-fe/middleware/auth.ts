export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return;

  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) return;

  return navigateTo({
    path: "/auth/login",
    query: { redirect: to.fullPath },
  });
});
