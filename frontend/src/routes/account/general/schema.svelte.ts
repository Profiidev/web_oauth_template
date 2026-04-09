import { z } from 'zod';

export const generalSettings = z.object({
  username: z.string().min(1, 'Username is required')
});
