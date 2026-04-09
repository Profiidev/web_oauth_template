import { z } from 'zod';

export const authSettings = z
  .object({
    old_password: z.string().min(1, 'Old password is required'),
    new_password: z.string().min(1, 'New password is required'),
    new_password_confirm: z.string().min(1, 'Please confirm your new password')
  })
  .superRefine(({ new_password, new_password_confirm }, ctx) => {
    if (new_password !== new_password_confirm) {
      ctx.addIssue({
        code: 'custom',
        message: 'New password and confirmation do not match',
        path: ['new_password_confirm']
      });
    }
  });
