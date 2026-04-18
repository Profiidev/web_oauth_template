import type { MailSettings } from '$lib/client';
import type { FormValue } from '@profidev/pleiades/components/form/types';
import { z } from 'zod';

export const mailSettings = z
  .object({
    smtp_enabled: z.boolean(),
    smtp_from_address: z.email().optional(),
    smtp_from_name: z.string().optional().default('{{project-name}}'),
    smtp_host: z.string().optional(),
    smtp_password: z.string().optional(),
    smtp_port: z.number().optional(),
    smtp_user: z.string().optional(),
    use_tls: z.boolean()
  })
  .superRefine((data, ctx) => {
    const smtpFields: (keyof typeof data)[] = [
      'smtp_host',
      'smtp_port',
      'smtp_user',
      'smtp_password',
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

export const reformat = (form: FormValue<typeof mailSettings>) => {
  const data: MailSettings = {};
  if (form.smtp_enabled) {
    data.smtp = {
      from_address: form.smtp_from_address!,
      from_name: form.smtp_from_name,
      password: form.smtp_password!,
      port: form.smtp_port!,
      server: form.smtp_host!,
      use_tls: form.use_tls,
      username: form.smtp_user!
    };
  }
  return data;
};

export const unReformat = (
  settings: MailSettings
): FormValue<typeof mailSettings> => ({
    smtp_enabled: Boolean(settings.smtp),
    smtp_from_address: settings.smtp?.from_address,
    smtp_from_name: settings.smtp?.from_name || '{{project-name}}',
    smtp_host: settings.smtp?.server,
    smtp_password: settings.smtp?.password || '',
    smtp_port: settings.smtp?.port,
    smtp_user: settings.smtp?.username,
    use_tls: settings.smtp?.use_tls || false
  });
