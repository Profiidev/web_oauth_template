import { z } from 'zod';

export const databaseSetupSchema = z.object({
  disclaimerAccepted: z.boolean().refine((val) =>  val, {
    message: 'You must accept the disclaimer to proceed.'
  })
});

export const adminUser = z.object({
  email: z.email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  username: z.string().min(3, 'Username must be at least 3 characters long.')
});
