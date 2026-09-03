/**
 * Test helpers for SvelteKit `load` functions. Not a test file (no `.test`
 * suffix) so the vitest glob ignores it.
 */

/** A `fetch` stand-in that always resolves to a canned JSON response. */
export const jsonFetch =
  (body: unknown, status = 200): typeof fetch =>
  async () =>
    new Response(status === 204 ? null : JSON.stringify(body), {
      headers: { 'content-type': 'application/json' },
      status
    });

/**
 * Invokes a SvelteKit `load` with a loosely-typed event and returns the result
 * as `any`, so tests can read data fields without fighting the `void`-union
 * return type of `PageLoad`/`LayoutLoad`.
 */
export const runLoad = async (
  load: (event: never) => unknown,
  event: unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => load(event as never);

interface ThrownRedirect {
  status: number;
  location: string;
}

/**
 * Runs `fn` and returns the SvelteKit redirect it throws. Fails if `fn` does
 * not redirect.
 */
export const catchRedirect = async (
  fn: () => unknown
): Promise<ThrownRedirect> => {
  try {
    await fn();
  } catch (error) {
    return error as ThrownRedirect;
  }
  throw new Error('expected a redirect to be thrown');
};
