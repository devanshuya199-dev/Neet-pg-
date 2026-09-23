import { z } from "zod";

export const predictorInputSchema = z.object({
  mode: z.enum(["marks", "rank"]),
  marks: z.number().int().min(0).max(800).optional(),
  air: z.number().int().min(1).optional(),
  category: z.enum(["UR", "OBC", "EWS", "SC", "ST", "PwD"]),
  domicile: z.string().min(2),
  quota: z.enum(["AIQ", "State_Quota", "DNB", "Management", "NRI", "Central"]),
  branchIds: z.array(z.string()).default([]),
  states: z.array(z.string()).default([]),
  collegeTypes: z.array(z.enum(["Govt", "Private", "Deemed", "Central", "DNB"])).default([]),
  maxFee: z.number().nonnegative().optional()
}).superRefine((v, ctx) => {
  if (v.mode === "marks" && v.marks == null) ctx.addIssue({ code: "custom", message: "Marks are required in marks mode." });
  if (v.mode === "rank" && v.air == null) ctx.addIssue({ code: "custom", message: "AIR is required in rank mode." });
});
