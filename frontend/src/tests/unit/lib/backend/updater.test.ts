import { beforeEach, describe, expect, it, vi } from 'vitest';

const invalidate = vi.fn(async (_arg: unknown) => Promise.resolve());
const connect = vi.fn((_handler: unknown) => {});
const disconnect = vi.fn(() => {});

vi.mock('$app/navigation', () => ({
  invalidate: async (arg: unknown) => invalidate(arg)
}));
vi.mock('@profidev/pleiades/backend', () => ({
  createWebsocket: () => ({
    connect: (handler: unknown) => connect(handler),
    disconnect: () => disconnect()
  })
}));

const { UpdateType, connectWebsocket, disconnectWebsocket } =
  await import('$lib/backend/updater.svelte');

type Handler = (msg: { type: string; uuid?: string }, user: string) => void;

/** Registers the websocket and returns the message handler pleiades received. */
const getHandler = (user = 'me'): Handler => {
  connectWebsocket(user);
  return connect.mock.calls.at(-1)?.[0] as Handler;
};

/** All string urls passed to invalidate (ignores predicate-function calls). */
const invalidatedUrls = () =>
  invalidate.mock.calls
    .map((c) => c[0])
    .filter((a): a is string => typeof a === 'string');

beforeEach(() => {
  invalidate.mockClear();
  connect.mockClear();
  disconnect.mockClear();
});

describe('UpdateType enum', () => {
  it('exposes every update kind as a matching string', () => {
    expect(UpdateType.Settings).toBe('Settings');
    expect(UpdateType.User).toBe('User');
    expect(UpdateType.UserPermissions).toBe('UserPermissions');
    expect(UpdateType.Group).toBe('Group');
  });
});

describe('connect / disconnect delegation', () => {
  it('registers a handler with pleiades', () => {
    connectWebsocket('alice');
    expect(connect).toHaveBeenCalledWith(expect.any(Function));
  });

  it('delegates disconnect', () => {
    disconnectWebsocket();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});

describe('handleMessage', () => {
  it('invalidates settings via a path predicate', () => {
    const handler = getHandler();
    handler({ type: UpdateType.Settings }, 'me');
    const predicate = invalidate.mock.calls[0]?.[0] as (u: URL) => boolean;
    expect(typeof predicate).toBe('function');
    expect(predicate(new URL('http://x/api/settings/mail'))).toBe(true);
    expect(predicate(new URL('http://x/api/other'))).toBe(false);
  });

  it('invalidates the management endpoints and, when the uuid matches, user info', () => {
    const handler = getHandler('me');
    handler({ type: UpdateType.User, uuid: 'me' }, 'me');
    const urls = invalidatedUrls();
    expect(urls).toContain('/api/user/management');
    expect(urls).toContain('/api/user/management/me');
    expect(urls).toContain('/api/group/users');
    expect(urls).toContain('/api/user/info');
  });

  it('does not invalidate user info when the uuid is a different user', () => {
    const handler = getHandler('me');
    handler({ type: UpdateType.User, uuid: 'someone-else' }, 'me');
    expect(invalidatedUrls()).not.toContain('/api/user/info');
  });

  it('invalidates only user info on a UserPermissions update', () => {
    const handler = getHandler();
    handler({ type: UpdateType.UserPermissions }, 'me');
    expect(invalidatedUrls()).toEqual(['/api/user/info']);
  });

  it('invalidates the group endpoints with the uuid', () => {
    const handler = getHandler();
    handler({ type: UpdateType.Group, uuid: 'g1' }, 'me');
    expect(invalidatedUrls()).toEqual([
      '/api/group',
      '/api/group/g1',
      '/api/user/management/groups'
    ]);
  });

  it('does nothing for an unknown message type', () => {
    const handler = getHandler();
    handler({ type: 'Nonsense' }, 'me');
    expect(invalidate).not.toHaveBeenCalled();
  });
});
