/**
 * Bentuk minimal error di body respons GraphQL (setelah JSON.parse).
 */
export type GraphqlResponseErrorLike = {
  message?: string;
  extensions?: { code?: string };
  code?: string;
};

/**
 * Future-proof: untuk request multipart GraphQL, jika respons punya `errors`,
 * anggap ada kemungkinan stream Upload tidak sempat dibaca resolver, lalu lakukan drain.
 * `drainPossibleUploadValuesDeep` sudah defensif/no-op untuk stream yang sudah habis.
 */
export function shouldDrainOrphanedMultipartStreams(
  errors: readonly GraphqlResponseErrorLike[] | undefined,
): boolean {
  return Array.isArray(errors) && errors.length > 0;
}
