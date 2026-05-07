/**
 * Ensures an API endpoint string has exactly one leading and one trailing slash.
 * Used by `useCrud` to normalize user-provided endpoint paths before making requests.
 *
 * @example
 * normalizeEndpoint('api/articles')   // '/api/articles/'
 * normalizeEndpoint('/api/articles')  // '/api/articles/'
 * normalizeEndpoint('/api/articles/') // '/api/articles/'
 */
export function normalizeEndpoint(endpoint: string): string {
  const stripped = endpoint.replace(/^\/+|\/+$/g, "");
  return `/${stripped}/`;
}
