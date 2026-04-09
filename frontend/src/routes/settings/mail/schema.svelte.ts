import type { MailSettings } from '$lib/client';
import type { FormValue } from 'positron-components/components/form/types';
import { z } from 'zod';

export const mailSettings = z
  .object({
    smtp_enabled: z.boolean(),
    smtp_host: z.string().optional(),
    smtp_port: z.number().optional(),
    smtp_user: z.string().optional(),
    smtp_password: z.string().optional(),
    smtp_from_address: z.email().optional(),
    smtp_from_name: z.string().optional().default('Hibernation'),
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
            path: [field],
            message: 'This field is required when SMTP is enabled.'
          });
        }
      }
    }
  });

export const reformat = (form: FormValue<typeof mailSettings>) => {
  let data: MailSettings = {};
  if (form.smtp_enabled) {
    data.smtp = {
      server: form.smtp_host!,
      port: form.smtp_port!,
      username: form.smtp_user!,
      password: form.smtp_password!,
      from_address: form.smtp_from_address!,
      from_name: form.smtp_from_name!,
      use_tls: form.use_tls
    };
  }
  return data;
};

export const unReformat = (
  settings: MailSettings
): FormValue<typeof mailSettings> => {
  return {
    smtp_enabled: !!settings.smtp,
    smtp_host: settings.smtp?.server,
    smtp_port: settings.smtp?.port,
    smtp_user: settings.smtp?.username,
    smtp_password: settings.smtp?.password || '',
    smtp_from_address: settings.smtp?.from_address,
    smtp_from_name: settings.smtp?.from_name || 'Hibernation',
    use_tls: settings.smtp?.use_tls || false
  };
};
