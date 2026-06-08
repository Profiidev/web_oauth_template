import type { MailSettings } from '$lib/client';
import type { FormValue } from '@profidev/pleiades/components/form/types';
import { z } from 'zod';

export const mailSettings = z
  .object({
    smtp_enabled: z.boolean(),
    smtp_from_address: z.email().optional(),
    smtp_from_name: z.string().optional().default('Positron'),
    smtp_password: z.string().default(''),
    smtp_port: z.number().optional(),
    smtp_server: z.string().optional(),
    smtp_use_tls: z.boolean(),
    smtp_username: z.string().optional()
  })
  .superRefine((data, ctx) => {
    const smtpFields: (keyof typeof data)[] = [
      'smtp_server',
      'smtp_port',
      'smtp_username',
      'smtp_from_address',
      'smtp_from_name'
    ];

    if (data.smtp_enabled) {
      for (const field of smtpFields) {
        if (!data[field]) {
          ctx.addIssue({
            code: 'custom',
            message: 'This field is required when SMTP is enabled.',
            path: [field]
          });
        }
      }
    }
  });

export const reformat = (
  data: FormValue<typeof mailSettings>,
  from_env: string[]
) => {
  const settings: MailSettings = {
    ...data
  };

  for (const key of from_env) {
    if (key in settings) {
      // oxlint-disable-next-line no-unsafe-type-assertion no-dynamic-delete
      delete settings[key as keyof MailSettings];
    }
  }

  return settings;
};

export const unReformat = (
  settings: MailSettings
): FormValue<typeof mailSettings> => ({
  smtp_enabled: settings.smtp_enabled ?? false,
  smtp_from_address: settings.smtp_from_address ?? undefined,
  smtp_from_name: settings.smtp_from_name || 'Positron',
  smtp_password: settings.smtp_password || '',
  smtp_port: settings.smtp_port ?? undefined,
  smtp_server: settings.smtp_server ?? undefined,
  smtp_use_tls: settings.smtp_use_tls || false,
  smtp_username: settings.smtp_username ?? undefined
});
