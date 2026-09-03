import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

const toastError = vi.fn();
vi.mock('@profidev/pleiades/components/util/general', () => ({
  toast: { error: toastError, success: vi.fn() }
}));

vi.mock('$lib/backend/auth.svelte', () => ({
  getEncrypt: () => undefined,
  getOidcUrl: vi.fn(async () => undefined)
}));

vi.mock('$lib/backend/updater.svelte', () => ({
  connectWebsocket: vi.fn(),
  disconnectWebsocket: vi.fn()
}));

// The page reads the error param via `afterNavigate`; the global stub is a
// no-op, so override it to actually invoke the callback like a real navigation.
vi.mock('$app/navigation', () => ({
  afterNavigate: (fn: () => void) => fn(),
  beforeNavigate: vi.fn(),
  disableScrollHandling: vi.fn(),
  goto: vi.fn(async () => Promise.resolve()),
  invalidate: vi.fn(async () => Promise.resolve()),
  invalidateAll: vi.fn(async () => Promise.resolve()),
  onNavigate: vi.fn(),
  preloadCode: vi.fn(async () => Promise.resolve()),
  preloadData: vi.fn(async () => Promise.resolve()),
  pushState: vi.fn(),
  replaceState: vi.fn()
}));

const Page = (await import('$routes/login/+page.svelte')).default;

const data = (error?: string) =>
  ({
    config: Promise.resolve({
      instant_redirect: false,
      mail_enabled: false,
      sso_type: 'None'
    }),
    error,
    redirectTo: '/',
    skip: false
  }) as never;

afterEach(() => toastError.mockClear());

describe('login page', () => {
  it('renders the login form fields', () => {
    render(Page, { data: data() });
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it.each([
    ['missing_code', 'SSO login failed: Missing authorization code.'],
    ['oidc_not_configured', 'SSO login failed: OIDC is not configured.'],
    ['weird', 'SSO login failed: weird']
  ])('maps the %s error to a toast', async (code, message) => {
    render(Page, { data: data(code) });
    await vi.waitFor(() => expect(toastError).toHaveBeenCalledWith(message));
  });

  it('shows no error toast when there is no error', () => {
    render(Page, { data: data() });
    expect(toastError).not.toHaveBeenCalled();
  });
});
