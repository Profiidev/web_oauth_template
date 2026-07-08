import { HttpResponse, http, ws } from 'msw';
import * as gen from '$lib/client/msw.gen';
import * as data from './data';
import { type Client, createClient, createConfig } from '$lib/client/client';
import type { ClientOptions } from '$lib/client/types.gen';

const client: Client = createClient(createConfig<ClientOptions>());

/**
 * No-op WebSocket mock for the updater channel. The app opens this socket on
 * every page (see `connectWebsocket`); without a handler the preview server
 * answers with `404`, which clutters the test output. Accept the connection and
 * do nothing (never forward to a real server) so no update events fire.
 */
const updaterWs = ws.link('*/api/ws/updater');

/**
 * No-op mock for the public-note update channel. The public-share page opens
 * this socket to learn when the owner revokes access; accept it and stay quiet
 * so the page renders without a dangling connection error.
 */
const publicUpdaterWs = ws.link('*/api/notes/update/*');

/**
 * App-login device channel. The login page opens this socket and renders a QR
 * code from the first message it receives, so emit a fake device code on
 * connection to drive the "App Login" flow.
 */
const appLoginWs = ws.link('*/api/auth/app/device_login');

/**
 * Reuses the generated `handle*` factories (the same mock api the unit
 * tests use). The factories build their URL from the client's `baseUrl`; in the
 * preview server every `/api/*` request is host-rewritten to the backend by
 * `handleFetch`, so we build the handlers with `baseUrl = '*'` to match any
 * origin, then restore the real config for the SDK's actual requests.
 */
const original = client.getConfig();
client.setConfig({ ...original, baseUrl: '*' });

const j = (d: unknown) => HttpResponse.json(d as never) as never;
const scn = (cookies: Record<string, string>) => data.scenarioOf(cookies);

export const handlers = [
  updaterWs.addEventListener('connection', () => {}),
  publicUpdaterWs.addEventListener('connection', () => {}),
  // oxlint-disable-next-line no-shadow
  appLoginWs.addEventListener('connection', ({ client }) => {
    client.send('device-login-code');
  }),

  gen.handleIsSetup(({ cookies }) => j(data.isSetupOf(cookies))),
  gen.handleGetOidcSettings(() => j(data.oidcSettings)),
  gen.handleInfo(({ cookies }) =>
    data.isAnonymous(cookies)
      ? (new HttpResponse(null, { status: 401 }) as never)
      : j(data.adminUser)
  ),
  gen.handleAuthConfig(() => j(data.authConfig)),
  gen.handleMailActive(({ cookies }) => j(data.mailActiveOf(cookies))),
  gen.handleGetMailSettings(() => j(data.mailSettings)),
  gen.handleKey(() => j({ key: 'test-public-key' })),

  // Lists (scenario-aware: `mock_scenario=empty` cookie => empty state).
  gen.handleListGroups(({ cookies }) => j(data.groups[scn(cookies)])),
  gen.handleListUsers(({ cookies }) => j(data.users[scn(cookies)])),

  // Simple lists used by detail/create pages.
  gen.handleListGroupsSimple(({ cookies }) =>
    j(data.simpleGroups[scn(cookies)])
  ),
  gen.handleListUsersSimple(({ cookies }) => j(data.simpleUsers[scn(cookies)])),

  // Details.
  gen.handleGroupInfo(({ params }) =>
    // The uuid is a path param; return a non-admin group for group-staff so its
    // Editable permissions matrix renders (the admin group hides it).
    j(
      params.uuid === 'group-staff' ? data.groupStaffDetails : data.groupDetails
    )
  ),
  gen.handleUserInfo(() => j(data.userDetails)),

  // Mutations return a generic success so submit flows resolve.
  gen.handleCreateGroup(() => j({ uuid: 'group-new' })),
  gen.handleCreateUser(() => j({ uuid: 'user-new' })),
  gen.handleSendResetLink(() => new HttpResponse(null, { status: 200 })),

  // Catch-all: any other `/api/*` call resolves with an empty 200 so unmocked
  // Endpoints never crash a page render.
  http.all('*/api/*', () => HttpResponse.json({}))
];

client.setConfig(original);
