import { z } from "zod";

export const passwordChange = z.object({
  old_password: z.string().min(1, "Old Password is required"),
  password: z.string().min(1, "Password is required"),
  password_confirm: z.string().min(1, "Password Confirm is required"),
});

export const emailChangeSchema = z
  .object({
    email: z.email().default(""),
    email_input: z.boolean().default(true),
    new_code: z.string().default(""),
    old_code: z.string().default(""),
  })
  .superRefine((val, ctx) => {
    if (!val.email_input) {
      if (!val.new_code || val.new_code.length !== 6) {
        ctx.addIssue({
          code: "custom",
          message: "Code must be 6 characters long",
          path: ["new_code"],
        });
      }

      if (!val.old_code || val.old_code.length !== 6) {
        ctx.addIssue({
          code: "custom",
          message: "Code must be 6 characters long",
          path: ["old_code"],
        });
      }
    }
  });
