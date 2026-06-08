import type { UserSettings } from '$lib/client';
import type { FormValue } from '@profidev/pleiades/components/form/types';
import { z } from 'zod';

export const userSettings = z
  .object({
    oidc_client_id: z.string().optional(),
    oidc_client_secret: z.string().default(''),
    oidc_enabled: z.boolean().default(false),
    oidc_group_claim: z.string().optional(),
    oidc_group_sync: z.boolean().default(false),
    oidc_image_sync: z.boolean().default(false),
    oidc_issuer: z.url().optional(),
    oidc_pkce: z.boolean().default(false),
    oidc_scopes: z.string().optional(),
    sso_create_user: z.boolean().default(false),
    sso_instant_redirect: z.boolean().default(false)
  })
  .superRefine((data, ctx) => {
    const oidcFields: (keyof typeof data)[] = ['oidc_issuer', 'oidc_client_id'];

    if (data.oidc_enabled) {
      for (const field of oidcFields) {
        if (!data[field]) {
          ctx.addIssue({
            code: 'custom',
            message: 'This field is required when OIDC is enabled.',
            path: [field]
          });
        }
      }
    }
  });

export const reformat = (
  form: FormValue<typeof userSettings>,
  from_env: string[]
): UserSettings => {
  const settings: UserSettings = {
    ...form,
    oidc_group_claim: form.oidc_group_claim || undefined
  };

  for (const field of from_env) {
    if (field in settings) {
      // oxlint-disable-next-line no-unsafe-type-assertion no-dynamic-delete
      delete settings[field as keyof UserSettings];
    }
  }

  return settings;
};

export const unReformat = (
  settings: UserSettings
): FormValue<typeof userSettings> => ({
  ...settings,
  oidc_client_id: settings.oidc_client_id ?? undefined,
  oidc_client_secret: settings.oidc_client_secret || '',
  oidc_enabled: settings.oidc_enabled ?? false,
  oidc_group_claim: settings.oidc_group_claim ?? undefined,
  oidc_group_sync: settings.oidc_group_sync ?? false,
  oidc_image_sync: settings.oidc_image_sync ?? false,
  oidc_issuer: settings.oidc_issuer ?? undefined,
  oidc_pkce: settings.oidc_pkce ?? false,
  oidc_scopes: settings.oidc_scopes ?? undefined,
  sso_create_user: settings.sso_create_user ?? false,
  sso_instant_redirect: settings.sso_instant_redirect ?? false
});
