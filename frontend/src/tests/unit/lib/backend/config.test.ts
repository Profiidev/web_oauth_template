import { describe, expect, it } from 'vitest';
import { createClientConfig } from '$lib/backend/config';

describe('createClientConfig', () => {
  it('preserves the incoming config and pins a baseUrl', () => {
    const result = createClientConfig({
      headers: { 'x-test': '1' }
    } as never);

    expect(result.headers).toEqual({ 'x-test': '1' });
    // Browser -> undefined; SSR -> the localhost placeholder used to keep
    // Node's Request constructor happy.
    expect([undefined, 'http://localhost:12356']).toContain(result.baseUrl);
  });
});
