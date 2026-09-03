import { expect } from '@playwright/test';
import { test } from '$test_helpers/e2e-fixture';
import { gotoReady } from '$test_helpers/layout';

test('redirects /password to the forgot-password page', async ({ page }) => {
  await gotoReady(page, '/password');
  await expect(page).toHaveURL(/\/password\/forgot/);
  await expect(page.getByText('Forgot Password')).toBeVisible();
});
