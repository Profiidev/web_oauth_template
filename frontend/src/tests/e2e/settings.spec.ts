import { expect } from '@playwright/test';
import { test } from '$test_helpers/e2e-fixture';
import { setupSession } from '$test_helpers/session';
import { expectNoHorizontalOverflow, gotoReady } from '$test_helpers/layout';

test.beforeEach(async ({ context }) => setupSession(context));

test('redirects /settings to the user tab', async ({ page }) => {
  await gotoReady(page, '/settings');
  await expect(page).toHaveURL(/\/settings\/user/);
});

test.describe('mail settings', () => {
  test('renders the mail configuration form', async ({ page }) => {
    await gotoReady(page, '/settings/mail');

    await expect(
      page.getByRole('heading', { name: 'Mail Settings' })
    ).toBeVisible();
    await expect(page.getByText('Enable SMTP')).toBeVisible();
    await expect(page.getByPlaceholder('mail.example.com')).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('saves mail settings when SMTP is disabled', async ({ page }) => {
    await gotoReady(page, '/settings/mail');

    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(
      page.getByText('Mail settings saved successfully')
    ).toBeVisible();
  });

  test('requires the SMTP fields when SMTP is enabled', async ({ page }) => {
    await gotoReady(page, '/settings/mail');

    // First switch on the form is "Enable SMTP".
    await page.getByRole('switch').first().click();
    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(
      page.getByText('This field is required when SMTP is enabled.').first()
    ).toBeVisible();
  });
});
