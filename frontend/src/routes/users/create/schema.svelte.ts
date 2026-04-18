import z from 'zod';

export const information = z.object({
  email: z.email('Invalid email address').default(''),
  name: z.string().min(1, 'Name is required').default(''),
  password: z.string().optional().default('')
});
