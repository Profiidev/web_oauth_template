import { describe, expect, it } from 'vitest';
import {
  buildLoginUrl,
  getRedirectTarget,
  isSafeRedirectPath
} from '$lib/redirect';

describe('isSafeRedirectPath', () => {
  it.each(['/', '/users', '/groups/abc?tab=1', '/password/reset?token=x'])(
    'accepts %s',
    (path) => {
      expect(isSafeRedirectPath(path)).toBe(true);
    }
  );

  it.each([
    '',
    'users',
    '//evil.com',
    'http://evil.com',
    '/login',
    '/login?redirect=%2Fusers',
    'https://evil.com/path'
  ])('rejects %s', (path) => {
    expect(isSafeRedirectPath(path)).toBe(false);
  });
});

describe('buildLoginUrl', () => {
  it('returns /login for an unsafe intended path', () => {
    expect(buildLoginUrl('//evil.com')).toBe('/login');
    expect(buildLoginUrl('/login')).toBe('/login');
  });

  it('appends a redirect query for a safe intended path', () => {
    expect(buildLoginUrl('/users')).toBe('/login?redirect=%2Fusers');
    expect(buildLoginUrl('/groups/1?tab=2')).toBe(
      '/login?redirect=%2Fgroups%2F1%3Ftab%3D2'
    );
  });
});

describe('getRedirectTarget', () => {
  it('returns a validated redirect param', () => {
    const params = new URLSearchParams('redirect=%2Fusers');
    expect(getRedirectTarget(params)).toBe('/users');
  });

  it('falls back when the redirect param is missing or unsafe', () => {
    expect(getRedirectTarget(new URLSearchParams())).toBe('/');
    expect(getRedirectTarget(new URLSearchParams('redirect=//evil.com'))).toBe(
      '/'
    );
    expect(getRedirectTarget(new URLSearchParams('redirect=/login'))).toBe('/');
  });

  it('honours a custom fallback', () => {
    expect(getRedirectTarget(new URLSearchParams(), '/account')).toBe(
      '/account'
    );
  });
});
