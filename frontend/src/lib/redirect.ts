export const isSafeRedirectPath = (path: string): boolean => {
  if (!path.startsWith('/') || path.startsWith('//')) {
    return false;
  }

  try {
    const { pathname } = new URL(path, 'http://localhost');
    return pathname !== '/login';
  } catch {
    return false;
  }
};

export const buildLoginUrl = (intendedPath: string): string => {
  if (isSafeRedirectPath(intendedPath)) {
    return `/login?redirect=${encodeURIComponent(intendedPath)}`;
  }

  return '/login';
};

export const getRedirectTarget = (
  searchParams: URLSearchParams,
  fallback = '/'
): string => {
  const redirect = searchParams.get('redirect');
  if (redirect && isSafeRedirectPath(redirect)) {
    return redirect;
  }

  return fallback;
};
