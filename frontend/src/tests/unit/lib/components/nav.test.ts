import { describe, expect, it } from 'vitest';
import { items, noAuthPaths, noSidebarPaths } from '$lib/components/nav.svelte';
import { Permission } from '$lib/permissions.svelte';

const allItems = items.flatMap((group) => group.items);
const permissionValues = new Set<string>(Object.values(Permission));

describe('nav items', () => {
  it('defines the top-level groups in order', () => {
    expect(items.map((g) => g.label)).toEqual(['Overview', 'Administration']);
  });

  it('gives every group a label and at least one item', () => {
    for (const group of items) {
      expect(group.label).toBeTruthy();
      expect(group.items.length).toBeGreaterThan(0);
    }
  });

  it('gives every item a label, an icon and an absolute href', () => {
    for (const item of allItems) {
      expect(item.label).toBeTruthy();
      expect(item.icon).toBeTruthy();
      expect(item.href.startsWith('/')).toBe(true);
    }
  });

  it('has unique hrefs', () => {
    const hrefs = allItems.map((i) => i.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('only references valid permissions when one is required', () => {
    for (const item of allItems) {
      if (item.requiredPermission !== undefined) {
        expect(permissionValues.has(item.requiredPermission)).toBe(true);
      }
    }
  });

  it('leaves the Overview entry public (no permission)', () => {
    const overview = allItems.find((i) => i.href === '/');
    expect(overview?.requiredPermission).toBeUndefined();
  });
});

describe('noSidebarPaths', () => {
  it('lists only absolute paths', () => {
    for (const path of noSidebarPaths) {
      expect(path.startsWith('/')).toBe(true);
    }
  });

  it('hides the sidebar on the auth/onboarding flows', () => {
    expect(noSidebarPaths).toEqual(
      expect.arrayContaining(['/login', '/setup'])
    );
  });

  it('never hides the sidebar on a path that has a nav item', () => {
    for (const item of allItems) {
      expect(noSidebarPaths).not.toContain(item.href);
    }
  });
});

describe('noAuthPaths', () => {
  it('lists only absolute paths', () => {
    for (const path of noAuthPaths) {
      expect(path.startsWith('/')).toBe(true);
    }
  });

  it('has no duplicate entries', () => {
    expect(new Set(noAuthPaths).size).toBe(noAuthPaths.length);
  });

  it('exposes the auth and onboarding flows publicly', () => {
    expect(noAuthPaths).toEqual([
      '/login',
      '/setup',
      '/password',
      '/password/forgot',
      '/password/reset'
    ]);
  });

  it('never exempts a path that has a nav item from auth', () => {
    for (const item of allItems) {
      expect(noAuthPaths).not.toContain(item.href);
    }
  });

  it('hides the sidebar on every public path', () => {
    for (const path of noAuthPaths) {
      expect(noSidebarPaths).toContain(path);
    }
  });
});
