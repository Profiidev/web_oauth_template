import z from 'zod';

export const information = z.object({
  name: z.string().min(1, 'Name is required').default(''),
  email: z.email('Invalid email address').default(''),
  password: z.string().optional().default('')
});
