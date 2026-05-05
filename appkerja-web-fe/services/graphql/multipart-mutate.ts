import type { DocumentNode } from "@apollo/client/core";
import { print } from "graphql";
import { normalizeGraphQLError } from "./error-handler";

/**
 * GraphQL multipart request (graphql-upload / Apollo Server).
 * @see https://github.com/jaydenseric/graphql-multipart-request-spec
 */
export async function gqlMultipartMutate<TData = unknown>(params: {
  endpoint: string;
  accessToken: string | null;
  query: DocumentNode;
  variables: Record<string, unknown>;
  file: File;
  fileMapPath: string;
}): Promise<{ data?: TData }> {
  const { endpoint, accessToken, query, variables, file, fileMapPath } = params;
  const form = new FormData();
  form.append(
    "operations",
    JSON.stringify({
      query: print(query),
      variables,
    }),
  );
  form.append("map", JSON.stringify({ "0": [fileMapPath] }));
  form.append("0", file, file.name);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: form,
  });

  let json: {
    data?: TData;
    errors?: { message: string; extensions?: Record<string, unknown> }[];
  };
  try {
    json = (await res.json()) as typeof json;
  } catch {
    throw normalizeGraphQLError(new Error(`Invalid JSON response (HTTP ${res.status})`));
  }

  if (json.errors?.length) {
    throw normalizeGraphQLError({ errors: json.errors });
  }
  if (!res.ok) {
    throw normalizeGraphQLError(new Error(`HTTP ${res.status}`));
  }
  return { data: json.data };
}
