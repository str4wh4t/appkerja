import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, Observable } from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

const REFRESH_TOKEN_MUTATION = `
  mutation AuthRefreshToken($authRefreshTokenInput: AuthRefreshTokenInput!) {
    authRefreshToken(authRefreshTokenInput: $authRefreshTokenInput) {
      access_token
      refresh_token
      expires_in
      token_type
    }
  }
`;

const getAccessToken = () => (import.meta.client ? localStorage.getItem("accessToken") : null);
const getRefreshToken = () => (import.meta.client ? localStorage.getItem("refreshToken") : null);

const clearAuthStorage = () => {
  if (!import.meta.client) return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  sessionStorage.removeItem("tokenPurpose");
};

const saveTokens = (accessToken: string, refreshToken?: string) => {
  if (!import.meta.client) return;
  localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
};

const requestTokenRefresh = async (endpoint: string): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: REFRESH_TOKEN_MUTATION,
      variables: {
        authRefreshTokenInput: {
          refresh_token: refreshToken,
        },
      },
    }),
  });

  const payload = await response.json();
  const refreshed = payload?.data?.authRefreshToken;
  const newAccessToken = refreshed?.access_token;
  if (!newAccessToken) return null;

  saveTokens(newAccessToken, refreshed?.refresh_token);
  return newAccessToken;
};

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const endpoint = config.public.graphqlEndpoint;
  const { start: startGraphqlLoading, stop: stopGraphqlLoading } = useGraphqlLoading();
  let refreshPromise: Promise<string | null> | null = null;

  const httpLink = new HttpLink({
    uri: endpoint,
    credentials: "include",
  });

  const authLink = setContext((_, { headers }) => {
    const token = getAccessToken();
    return {
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  });

  const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    const hasAuthError =
      graphQLErrors?.some(
        (error) =>
          error.extensions?.code === "UNAUTHENTICATED" || (error as any)?.code === "UNAUTHENTICATED"
      ) ||
      (networkError as any)?.statusCode === 401;

    const alreadyRetried = operation.getContext()?.alreadyRetried;
    if (!hasAuthError || alreadyRetried || !import.meta.client) return;

    if (!refreshPromise) {
      refreshPromise = requestTokenRefresh(endpoint).finally(() => {
        refreshPromise = null;
      });
    }

    return new Observable((observer) => {
      refreshPromise
        ?.then((newAccessToken) => {
          if (!newAccessToken) {
            clearAuthStorage();
          } else {
            operation.setContext(({ headers = {} }) => ({
              headers: {
                ...headers,
                Authorization: `Bearer ${newAccessToken}`,
              },
              alreadyRetried: true,
            }));
          }

          const subscription = forward(operation).subscribe({
            next: (value) => observer.next(value),
            error: (error) => observer.error(error),
            complete: () => observer.complete(),
          });

          return () => subscription.unsubscribe();
        })
        .catch((error) => {
          clearAuthStorage();
          observer.error(error);
        });
    });
  });

  const loadingLink = new ApolloLink((operation, forward) => {
    if (!forward) {
      return null;
    }

    return new Observable((observer) => {
      let settled = false;
      startGraphqlLoading();

      const settle = () => {
        if (settled) return;
        settled = true;
        stopGraphqlLoading();
      };

      const subscription = forward(operation).subscribe({
        next: (value) => observer.next(value),
        error: (error) => {
          settle();
          observer.error(error);
        },
        complete: () => {
          settle();
          observer.complete();
        },
      });

      return () => {
        settle();
        subscription.unsubscribe();
      };
    });
  });

  const apolloClient = new ApolloClient({
    link: ApolloLink.from([errorLink, loadingLink, authLink, httpLink]),
    cache: new InMemoryCache(),
    connectToDevTools: import.meta.dev,
  });

  return {
    provide: {
      apollo: apolloClient,
    },
  };
});
