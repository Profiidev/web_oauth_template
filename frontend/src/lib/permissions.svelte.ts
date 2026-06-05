export enum Permission {
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_EDIT = 'settings:edit',
  GROUP_VIEW = 'group:view',
  GROUP_EDIT = 'group:edit',
  USER_VIEW = 'user:view',
  USER_EDIT = 'user:edit'
}

export const avatarUrl = '/api/user/info/avatar';

export const OIDC_ERRORS = {
  invalid_client: 'SSO login failed: Invalid client.',
  invalid_code: 'SSO login failed: Invalid authorization code.',
  invalid_grant: 'SSO login failed: Invalid grant.',
  invalid_request: 'SSO login failed: Invalid request.',
  invalid_scope: 'SSO login failed: Invalid scope.',
  invalid_token: 'SSO login failed: Invalid token.',
  missing_code: 'SSO login failed: Missing authorization code.',
  missing_state: 'SSO login failed: Session state is missing.',
  oidc_not_configured: 'SSO login failed: OIDC is not configured.',
  unauthorized_client: 'SSO login failed: Unauthorized client.',
  unsupported_grant_type: 'SSO login failed: Unsupported grant type.',
  unsupported_response_type: 'SSO login failed: Unsupported response type.',
  user_not_authorized: 'SSO login failed: User does not exist.'
} as const;
