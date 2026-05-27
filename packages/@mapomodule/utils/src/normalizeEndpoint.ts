/**
 * Ensures an API endpoint path has exactly one leading and one trailing slash.
 * Query strings are preserved unchanged — the slash is inserted before the `?`.
 * Used by `useCrud` to normalize user-provided endpoint paths before making requests.
 *
 * @example
 * normalizeEndpoint('api/articles')          // '/api/articles/'
 * normalizeEndpoint('/api/articles')         // '/api/articles/'
 * normalizeEndpoint('/api/articles/')        // '/api/articles/'
 * normalizeEndpoint('/api/articles/?q=1')    // '/api/articles/?q=1'
 */
export function normalizeEndpoint(endpoint: string): string {
  const qIdx = endpoint.indexOf("?");
  const path = qIdx >= 0 ? endpoint.slice(0, qIdx) : endpoint;
  const query = qIdx >= 0 ? endpoint.slice(qIdx) : "";
  const stripped = path.replace(/^\/+|\/+$/g, "");
  return `/${stripped}/${query}`;
}
