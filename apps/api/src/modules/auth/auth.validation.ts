import { z } from 'zod';

export const UserZod = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
});
