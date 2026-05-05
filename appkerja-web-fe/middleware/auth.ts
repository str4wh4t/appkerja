const USER_ME_CHECK_QUERY = `
  query UserMeAuthGuard {
    usersMe {
      id
    }
  }
`;

export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.client) return;

  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    return navigateTo({
      path: "/auth/login",
      query: { redirect: to.fullPath },
    });
  }

  const endpoint = String(useRuntimeConfig().public.graphqlEndpoint ?? "").trim();
  if (!endpoint) return;

  try {
    const payload = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
      body: JSON.stringify({ query: USER_ME_CHECK_QUERY }),
    }).then((res) => res.json());

    const graphQLErrorMessage = String(payload?.errors?.[0]?.message ?? "");
    const hasSessionError =
      graphQLErrorMessage.toLowerCase().includes("session is no longer active") ||
      graphQLErrorMessage.toLowerCase().includes("unauthenticated");
    if (hasSessionError || !payload?.data?.usersMe?.id) {
      throw new Error(graphQLErrorMessage || "Invalid session");
    }
  } catch {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("tokenPurpose");
    return navigateTo({
      path: "/auth/login",
      query: { redirect: to.fullPath },
    });
  }

});
