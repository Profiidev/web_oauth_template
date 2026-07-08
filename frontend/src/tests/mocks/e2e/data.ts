import { Permission } from '$lib/permissions.svelte';

/** Scenario name read from the `mock_scenario` cookie (set by the e2e tests). */
export type Scenario =
  | 'default'
  | 'empty'
  | 'readonly'
  | 'at-limit'
  | 'transfer-at-limit';

/**
 * List data only varies between `default` and `empty`; the `readonly` scenario
 * reuses the default lists and only changes the note *detail* payload (see
 * `isReadonlyNote`), so a viewer can be exercised without new list fixtures.
 */
export const scenarioOf = (
  cookies: Record<string, string>
): 'default' | 'empty' =>
  cookies.mock_scenario === 'empty' ? 'empty' : 'default';

export const notesScenarioOf = (
  cookies: Record<string, string>
): 'default' | 'empty' | 'at-limit' => {
  if (cookies.mock_scenario === 'empty') {
    return 'empty';
  }
  if (cookies.mock_scenario === 'at-limit') {
    return 'at-limit';
  }
  return 'default';
};

/** True when the note detail should be served as a view-only (can_edit) note. */
export const isReadonlyNote = (cookies: Record<string, string>): boolean =>
  cookies.mock_scenario === 'readonly';

/**
 * The public-share page treats a user whose `info` falls back to the unknown
 * email as an anonymous visitor (and keeps them on the page); any other user is
 * redirected to the authenticated note view. The `mock_anon` cookie makes the
 * `info` endpoint report no session so the anonymous branch renders.
 */
export const isAnonymous = (cookies: Record<string, string>): boolean =>
  cookies.mock_anon === '1';

/** Admin user with every permission, so admin pages render full controls. */
export const adminUser = {
  email: 'admin@example.com',
  name: 'Ada Admin',
  permissions: Object.values(Permission),
  totp_enabled: false,
  uuid: 'user-admin'
};

const simpleUser = { id: 'user-1', name: 'Bob User' };
const simpleGroup = { name: 'Admins', uuid: 'group-admins' };

export const isSetup = {
  db_backend: 'sqlite',
  is_setup: true,
  storage_backend: 'local'
};

/** Returned when the `mock_setup=pending` cookie is set, so /setup renders. */
export const isSetupPending = {
  db_backend: 'sqlite',
  is_setup: false,
  storage_backend: 'local'
};

export const isSetupOf = (cookies: Record<string, string>) =>
  cookies.mock_setup === 'pending' ? isSetupPending : isSetup;

export const authConfig = { mail_enabled: true };
export const mailActive = { active: true };
/** `mock_mail=off` cookie disables mail, unlocking the admin-managed user
 * password/email/avatar controls that hide when mail is configured. */
export const mailActiveOf = (cookies: Record<string, string>) =>
  cookies.mock_mail === 'off' ? { active: false } : mailActive;
export const mailSettings = {
  from_env: [] as string[],
  settings: {
    smtp_enabled: false,
    smtp_from_name: 'Positron',
    smtp_use_tls: false
  }
};
export const siteUrl = { url: 'https://positron.example' };
export const oidcSettings = {
  client_id: '',
  issuer: '',
  scopes: [] as string[]
};

export const groups = {
  default: {
    admin_group: 'group-admins',
    groups: [
      {
        id: 'group-admins',
        name: 'Admins',
        permissions: [Permission.USER_VIEW, Permission.GROUP_VIEW],
        users: [simpleUser]
      },
      { id: 'group-staff', name: 'Staff', permissions: [], users: [] }
    ]
  },
  empty: { admin_group: undefined, groups: [] as unknown[] }
};

export const users = {
  default: [
    {
      email: 'bob@example.com',
      groups: [simpleGroup],
      name: 'Bob User',
      uuid: 'user-1'
    },
    {
      email: 'cara@example.com',
      groups: [],
      name: 'Cara User',
      uuid: 'user-2'
    }
  ],
  empty: [] as unknown[]
};

// Detail payloads.
export const groupDetails = {
  admin_group: 'group-admins',
  group: {
    id: 'group-admins',
    name: 'Admins',
    permissions: [Permission.USER_VIEW],
    users: [simpleUser]
  }
};

// A non-admin group, so the detail page renders the editable permissions
// Matrix (the admin group hides it).
export const groupStaffDetails = {
  admin_group: 'group-admins',
  group: {
    id: 'group-staff',
    name: 'Staff',
    permissions: [] as Permission[],
    users: [] as unknown[]
  }
};

export const userDetails = {
  email: 'bob@example.com',
  groups: [simpleGroup],
  name: 'Bob User',
  oidc_user: false,
  permissions: [Permission.USER_VIEW],
  uuid: 'user-1'
};

export const simpleUsers = { default: [simpleUser], empty: [] as unknown[] };
// The note owner (simpleUser) plus another user, so the note's share control
// Has someone to share with (the owner is filtered out of the options).
export const noteUsers = {
  default: [simpleUser, { id: 'user-2', name: 'Cara User' }],
  empty: [] as unknown[]
};
export const simpleGroups = { default: [simpleGroup], empty: [] as unknown[] };
