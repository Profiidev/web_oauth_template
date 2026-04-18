import { z } from 'zod';

export const resetPassword = z
  .object({
    confirm_password: z.string().min(1, 'Please confirm your password'),
    new_password: z
      .string()
      .min(6, 'Password must be at least 6 characters long'),
    token: z.string().min(1, 'Token is required')
  })
  .superRefine(({ new_password, confirm_password }, ctx) => {
    if (new_password !== confirm_password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirm_password']
      });
    }
  });
