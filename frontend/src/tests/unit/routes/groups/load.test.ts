import { describe, expect, it } from 'vitest';
import { load as listLoad } from '$routes/groups/+page';
import { load as detailLoad } from '$routes/groups/[uuid]/+page';
import { jsonFetch, runLoad } from '$test_helpers/load';

describe('groups list load', () => {
  it('splits out the admin group, error and groups', async () => {
    const result = await runLoad(listLoad, {
      fetch: jsonFetch({ admin_group: 'a1', groups: [{ id: 'g1' }] }),
      url: new URL('http://x/groups?error=x')
    });
    expect(result.error).toBe('x');
    await expect(result.admin_group).resolves.toBe('a1');
    await expect(result.groups).resolves.toEqual([{ id: 'g1' }]);
  });

  it('falls back when data is missing', async () => {
    const result = await runLoad(listLoad, {
      fetch: jsonFetch(null),
      url: new URL('http://x/groups')
    });
    await expect(result.admin_group).resolves.toBeUndefined();
    await expect(result.groups).resolves.toEqual([]);
  });
});

describe('group detail load', () => {
  it('passes the uuid and resolves the group + users promises', async () => {
    const result = await runLoad(detailLoad, {
      fetch: jsonFetch({ name: 'Admins' }),
      params: { uuid: 'g1' }
    });
    expect(result.uuid).toBe('g1');
    await expect(result.groupRes).resolves.toMatchObject({
      data: { name: 'Admins' }
    });
    await expect(result.usersPromise).resolves.toBeDefined();
  });
});
