import type { UserSettings } from '$lib/client';
import type { FormValue } from '@profidev/pleiades/components/form/types';
import { z } from 'zod';

export const userSettings = z
  .object({
    sso_instant_redirect: z.boolean(),
    sso_create_user: z.boolean(),
    oidc_enabled: z.boolean(),
    oidc_issuer: z.url().optional(),
    oidc_client_id: z.string().optional(),
    oidc_client_secret: z.string().optional(),
    oidc_scopes: z.string().optional()
  })
  .superRefine((data, ctx) => {
    const oidcFields: (keyof typeof data)[] = [
      'oidc_issuer',
      'oidc_client_id',
      'oidc_client_secret'
    ];

    if (data.oidc_enabled) {
      for (const field of oidcFields) {
        if (!data[field]) {
          ctx.addIssue({
            code: 'custom',
            path: [field],
            message: 'This field is required when OIDC is enabled.'
          });
        }
      }
    }
  });

export const reformat = (form: FormValue<typeof userSettings>) => {
  let data: UserSettings = form;
  if (form.oidc_enabled) {
    data.oidc = {
      issuer: form.oidc_issuer!,
      client_id: form.oidc_client_id!,
      client_secret: form.oidc_client_secret!,
      scopes: form.oidc_scopes?.split(' ') || []
    };
  }
  return data;
};

export const unReformat = (
  settings: UserSettings
): FormValue<typeof userSettings> => {
  return {
    sso_create_user: settings.sso_create_user,
    sso_instant_redirect: settings.sso_instant_redirect,
    oidc_enabled: !!settings.oidc,
    oidc_issuer: settings.oidc?.issuer,
    oidc_client_id: settings.oidc?.client_id,
    oidc_client_secret: settings.oidc?.client_secret || '',
    oidc_scopes: settings.oidc?.scopes.join(' ')
  };
};
