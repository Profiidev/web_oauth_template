import { expect } from '@playwright/test';
import { test } from '$test_helpers/e2e-fixture';
import { setupSession } from '$test_helpers/session';
import { expectNoHorizontalOverflow, gotoReady } from '$test_helpers/layout';

test('redirects to /login when unauthenticated', async ({ page }) => {
  await gotoReady(page, '/groups');
  await expect(page).toHaveURL(/\/login/);
});

test.describe('groups list', () => {
  test('lists groups in the default scenario', async ({ context, page }) => {
    await setupSession(context);
    await gotoReady(page, '/groups');

    await expect(page.getByRole('heading', { name: 'Groups' })).toBeVisible();
    await expect(page.getByText('Staff', { exact: true })).toBeVisible();
    await expect(page.getByText('Admins').first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test('shows an empty state with no groups', async ({ context, page }) => {
    await setupSession(context, 'empty');
    await gotoReady(page, '/groups');

    await expect(page.getByRole('heading', { name: 'Groups' })).toBeVisible();
    await expect(page.getByText('No results.')).toBeVisible();
  });
});

test.describe('group create', () => {
  test.beforeEach(async ({ context }) => setupSession(context));

  test('creates a group and navigates to its detail page', async ({ page }) => {
    await gotoReady(page, '/groups/create');

    await page.getByPlaceholder('Enter group name').fill('Engineering');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page).toHaveURL(/\/groups\/group-new/);
  });

  test('rejects an empty group name', async ({ page }) => {
    await gotoReady(page, '/groups/create');

    await page.getByRole('button', { name: 'Create' }).click();

    // Submission is blocked by validation, so we stay on the create page.
    await expect(page).toHaveURL(/\/groups\/create/);
  });
});

test.describe('group detail', () => {
  test.beforeEach(async ({ context }) => setupSession(context));

  test('renders the settings form for a group', async ({ page }) => {
    await gotoReady(page, '/groups/group-admins');

    await expect(page.getByRole('heading', { name: /Group:/ })).toContainText(
      'Admins'
    );
    await expect(page.getByPlaceholder('Enter group name')).toHaveValue(
      'Admins'
    );
    await expectNoHorizontalOverflow(page);
  });

  test('disables deletion of the admin group', async ({ page }) => {
    await gotoReady(page, '/groups/group-admins');

    await expect(page.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  test('saves changes to a group', async ({ page }) => {
    await gotoReady(page, '/groups/group-admins');

    const name = page.getByPlaceholder('Enter group name');
    await expect(name).toHaveValue('Admins');
    await name.fill('Administrators');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(
      page.getByText('Group Admins updated successfully')
    ).toBeVisible();
  });

  test('toggles a permission checkbox on a non-admin group', async ({
    page
  }) => {
    await gotoReady(page, '/groups/group-staff');

    // The admin group hides the matrix; a non-admin group exposes it.
    await expect(page.getByText('Permissions')).toBeVisible();

    const viewSettings = page.getByRole('checkbox', { name: 'View Settings' });
    await expect(viewSettings).not.toBeChecked();
    // The checkbox sits at the row's right edge inside a scroll area; dispatch
    // The click directly so Firefox doesn't stall on pointer actionability.
    await viewSettings.dispatchEvent('click');
    await expect(viewSettings).toBeChecked();

    await page
      .getByRole('button', { name: 'Save Changes' })
      .dispatchEvent('click');
    await expect(
      page.getByText('Group Staff updated successfully')
    ).toBeVisible();
  });
});
