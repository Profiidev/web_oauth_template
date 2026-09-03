import { expect } from '@playwright/test';
import { test } from '$test_helpers/e2e-fixture';
import { setupSession } from '$test_helpers/session';
import { gotoReady } from '$test_helpers/layout';

test.beforeEach(async ({ context }) => setupSession(context));

// Detail pages redirect back to their list with `?error=...` when a record
// fails to load; the list surfaces that as a toast.
test.describe('list error toasts', () => {
  test('shows a not-found toast on the users list', async ({ page }) => {
    await gotoReady(page, '/users?error=not_found');

    await expect(page.getByText('User not found')).toBeVisible();
  });

  test('shows a load-failure toast on the users list', async ({ page }) => {
    await gotoReady(page, '/users?error=other');

    await expect(page.getByText('Failed to load user')).toBeVisible();
  });

  test('shows a not-found toast on the groups list', async ({ page }) => {
    await gotoReady(page, '/groups?error=not_found');

    await expect(page.getByText('Group not found')).toBeVisible();
  });
});
