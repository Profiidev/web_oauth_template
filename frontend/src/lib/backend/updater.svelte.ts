import { invalidate } from '$app/navigation';
import {
  connectWebsocket as connect,
  disconnectWebsocket as disconnect
} from 'positron-components/backend';

export enum UpdateType {
  Settings = 'Settings',
  User = 'User',
  UserPermissions = 'UserPermissions',
  Group = 'Group',
}

export type UpdateMessage =
  | {
      type:
        | UpdateType.User
        | UpdateType.Group
      uuid: string;
    }
  | {
      type: UpdateType.Settings | UpdateType.UserPermissions;
    };

export const connectWebsocket = (user: string) => connect(user, handleMessage);
export const disconnectWebsocket = () => disconnect();

const handleMessage = (msg: UpdateMessage, user: string) => {
  switch (msg.type) {
    case UpdateType.Settings: {
      invalidate((url) => url.pathname.startsWith('/api/settings'));
      break;
    }
    case UpdateType.User: {
      invalidate('/api/user/management');
      invalidate(`/api/user/management/${msg.uuid}`);
      invalidate('/api/group/users');
      // Same as current user
      if (msg.uuid === user) {
        invalidate('/api/user/info');
      }
      break;
    }
    case UpdateType.UserPermissions: {
      invalidate('/api/user/info');
      break;
    }
    case UpdateType.Group: {
      invalidate('/api/group');
      invalidate(`/api/group/${msg.uuid}`);
      invalidate('/api/user/management/groups');
      break;
    }
  }
};
