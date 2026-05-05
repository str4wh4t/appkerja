import type { ApolloClient, NormalizedCacheObject } from "@apollo/client/core";

export const useGqlClient = (): ApolloClient<NormalizedCacheObject> => {
  const { $apollo } = useNuxtApp();
  return $apollo;
};
