type GraphQLErrorItem = {
  message: string;
  code?: string;
};

export class GraphQLServiceError extends Error {
  code?: string;
  errors: GraphQLErrorItem[];

  constructor(message: string, options?: { code?: string; errors?: GraphQLErrorItem[] }) {
    super(message);
    this.name = "GraphQLServiceError";
    this.code = options?.code;
    this.errors = options?.errors || [{ message, code: options?.code }];
  }
}

const asArray = (value: unknown): any[] => (Array.isArray(value) ? value : []);

const extractErrors = (error: any): GraphQLErrorItem[] => {
  const candidates = [
    ...asArray(error?.graphQLErrors),
    ...asArray(error?.errors),
    ...asArray(error?.networkError?.result?.errors),
    ...asArray(error?.networkError?.response?.errors),
    ...asArray(error?.cause?.errors),
    ...asArray(error?.cause?.result?.errors),
  ];

  const normalized = candidates
    .map((item) => ({
      message: item?.message,
      code: item?.code || item?.extensions?.code,
    }))
    .filter((item) => Boolean(item.message)) as GraphQLErrorItem[];

  if (normalized.length > 0) return normalized;

  if (error?.message) return [{ message: String(error.message) }];
  return [{ message: "Unexpected GraphQL error" }];
};

export const normalizeGraphQLError = (error: any): GraphQLServiceError => {
  const errors = extractErrors(error);
  return new GraphQLServiceError(errors[0].message, {
    code: errors[0].code,
    errors,
  });
};
