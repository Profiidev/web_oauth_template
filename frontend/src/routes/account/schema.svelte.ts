import { z } from "zod";

export const confirmSchema = z.object({
  password: z.string().min(1, "Password is required"),
});
