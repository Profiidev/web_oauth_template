import { expect } from '@playwright/test';
import { test } from '$test_helpers/e2e-fixture';
import { setupSession } from '$test_helpers/session';
import {
  expectNoHorizontalOverflow,
  gotoReady,
  openSidebar
} from '$test_helpers/layout';

test.beforeEach(async ({ context }) => {
  await setupSession(context);
});

test('overview page renders inside the app shell', async ({ page }) => {
  await gotoReady(page, '/');

  await expect(page.getByRole('main').getByText('Overview')).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('sidebar wires up the navigation targets', async ({ page }) => {
  await gotoReady(page, '/');
  await openSidebar(page);

  for (const href of ['/users', '/groups', '/settings']) {
    // oxlint-disable-next-line no-await-in-loop
    await expect(page.locator(`a[href="${href}"]`).first()).toBeAttached();
  }
});

test('navigating to users from the sidebar works', async ({ page }) => {
  await gotoReady(page, '/');
  await openSidebar(page);
  await page.locator('a[href="/users"]').first().click();

  await expect(page).toHaveURL(/\/users/);
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
});
