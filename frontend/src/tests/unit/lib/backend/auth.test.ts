import { afterEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();
const key = vi.fn();

vi.mock('@profidev/pleiades/backend', () => ({
  get: (...args: unknown[]) => get(...args),
  RequestError: { Other: 'Other' },
  ResponseType: { Json: 'Json', None: 'None', Text: 'Text' }
}));
vi.mock('$app/environment', () => ({ browser: true }));
vi.mock('$lib/client', () => ({ key: () => key() }));

class FakeJSEncrypt {
  pub?: string;
  setPublicKey(k: string) {
    this.pub = k;
  }
  encrypt(s: string) {
    return `enc:${s}`;
  }
}
vi.mock('jsencrypt', () => ({ JSEncrypt: FakeJSEncrypt }));

// The module calls `fetchKey()` at import time, so give it a resolvable key.
key.mockResolvedValue({ data: { key: 'PUBKEY' } });

const mod = await import('$lib/backend/auth.svelte');

afterEach(() => {
  get.mockReset();
  key.mockReset();
  key.mockResolvedValue({ data: { key: 'PUBKEY' } });
});

describe('fetchKey / getEncrypt', () => {
  it('builds a JSEncrypt instance from the fetched public key', async () => {
    const err = await mod.fetchKey();
    expect(err).toBeUndefined();

    const enc = mod.getEncrypt();
    expect(enc).toBeInstanceOf(FakeJSEncrypt);
    expect((enc as FakeJSEncrypt).pub).toBe('PUBKEY');
  });

  it('returns undefined without setting encrypt when no key data comes back', async () => {
    key.mockResolvedValueOnce({ data: null });
    const err = await mod.fetchKey();
    expect(err).toBeUndefined();
  });
});

describe('getOidcUrl', () => {
  it('requests the oidc url with the redirect query and returns it', async () => {
    get.mockResolvedValue({ url: 'https://idp/authorize' });

    const url = await mod.getOidcUrl('/account');

    expect(get).toHaveBeenCalledWith(
      '/api/auth/oidc/url?redirect_to=/account',
      expect.objectContaining({ res_type: 'Json' })
    );
    expect(url).toBe('https://idp/authorize');
  });

  it('omits the query string when no redirect is given', async () => {
    get.mockResolvedValue({ url: 'https://idp/authorize' });

    await mod.getOidcUrl();

    expect(get).toHaveBeenCalledWith(
      '/api/auth/oidc/url',
      expect.objectContaining({ res_type: 'Json' })
    );
  });

  it('returns undefined when the request fails (non-object result)', async () => {
    get.mockResolvedValue('Other');
    expect(await mod.getOidcUrl()).toBeUndefined();
  });
});
