import Settings from '@lucide/svelte/icons/settings';
import House from '@lucide/svelte/icons/house';
import { Permission } from '$lib/permissions.svelte';
import Users from '@lucide/svelte/icons/users';
import User from '@lucide/svelte/icons/user';
import type { NavGroup } from '@profidev/pleiades/components/nav/sidebar/types';

export const items: NavGroup[] = [
  {
    items: [{ href: '/', icon: House, label: 'Overview' }],
    label: 'Overview'
  },
  {
    items: [
      {
        href: '/users',
        icon: User,
        label: 'Users',
        requiredPermission: Permission.USER_VIEW
      },
      {
        href: '/groups',
        icon: Users,
        label: 'Groups',
        requiredPermission: Permission.GROUP_VIEW
      },
      {
        href: '/settings',
        icon: Settings,
        label: 'Settings',
        requiredPermission: Permission.SETTINGS_VIEW
      }
    ],
    label: 'Administration'
  }
];

export const noSidebarPaths = [
  '/login',
  '/setup',
  '/password',
  '/password/forgot',
  '/password/reset'
];
