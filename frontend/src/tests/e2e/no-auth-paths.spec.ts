import { expect } from '@playwright/test';
import { test } from '$test_helpers/e2e-fixture';
import { seedSetupPending, setupSession } from '$test_helpers/session';
import { gotoReady } from '$test_helpers/layout';

const pathname = (page: { url: () => string }) => new URL(page.url()).pathname;

// The public paths listed in `noAuthPaths` (`$lib/components/nav.svelte`) are
// Exempt from the auth guard, so the unauthenticated visitor is never bounced
// To /login. A couple of them perform their own in-app redirect that has
// Nothing to do with auth (kept in `expected`):
//   - /password always forwards to /password/forgot.
//   - /setup renders the first-run wizard only on an un-provisioned instance;
//     The `seedPending` flag seeds `mock_setup=pending` so it stays put.
const cases: { path: string; expected: string; seedPending?: boolean }[] = [
  { expected: '/login', path: '/login' },
  { expected: '/setup', path: '/setup', seedPending: true },
  { expected: '/password/forgot', path: '/password' },
  { expected: '/password/forgot', path: '/password/forgot' },
  { expected: '/password/reset', path: '/password/reset' }
];

test.describe('noAuthPaths without auth', () => {
  for (const { path, expected, seedPending } of cases) {
    test(`serves ${path} without redirecting to /login`, async ({
      context,
      page
    }) => {
      if (seedPending) {
        await seedSetupPending(context);
      }

      await gotoReady(page, path);

      expect(pathname(page)).toBe(expected);
    });
  }
});

test.describe('noAuthPaths with auth', () => {
  for (const { path, expected, seedPending } of cases) {
    // /login is the one public path that redirects an authenticated user away.
    if (path === '/login') {
      test('redirects /login away when authenticated', async ({
        context,
        page
      }) => {
        await setupSession(context);
        await gotoReady(page, '/login');

        await expect(page).not.toHaveURL(/\/login/);
      });
      continue;
    }

    test(`still serves ${path} when authenticated`, async ({
      context,
      page
    }) => {
      await setupSession(context);
      if (seedPending) {
        await seedSetupPending(context);
      }

      await gotoReady(page, path);

      expect(pathname(page)).toBe(expected);
    });
  }
});
