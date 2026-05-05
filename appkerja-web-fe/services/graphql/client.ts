import type {
  DocumentNode,
  ObservableQuery,
  OperationVariables,
} from "@apollo/client/core";
import { normalizeGraphQLError } from "./error-handler";

export const gqlQuery = async <TData = unknown, TVariables = OperationVariables>(
  query: DocumentNode,
  variables?: TVariables
): Promise<ObservableQuery.Result<TData>> => {
  const client = useGqlClient();
  try {
    return await client.query<TData, TVariables>({
      query,
      variables,
      fetchPolicy: "no-cache",
    });
  } catch (error: any) {
    throw normalizeGraphQLError(error);
  }
};

export const gqlMutation = async <TData = unknown, TVariables = OperationVariables>(
  mutation: DocumentNode,
  variables?: TVariables
) => {
  const client = useGqlClient();
  try {
    return await client.mutate<TData, TVariables>({
      mutation,
      variables,
    });
  } catch (error: any) {
    throw normalizeGraphQLError(error);
  }
};
