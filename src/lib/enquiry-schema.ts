import { z } from "zod";
import { serviceOptions } from "./content";
export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z
    .email("Please enter a valid email.")
    .max(254)
    .transform((v) => v.toLowerCase()),
  phone: z.string().trim().max(40).default(""),
  institution: z.string().trim().max(180).default(""),
  service: z
    .string()
    .refine((v) => serviceOptions.includes(v), "Please select a service."),
  message: z
    .string()
    .trim()
    .min(20, "Please include at least 20 characters.")
    .max(5000, "Please keep your message under 5,000 characters."),
  consent: z.literal(true, {
    error: "Please agree to be contacted about your enquiry.",
  }),
  submissionToken: z.uuid(),
  website: z.string().max(200).default(""),
});
export type EnquiryInput = z.infer<typeof enquirySchema>;
export const enquiryStatuses = ["new", "contacted", "closed"] as const;
export type EnquiryStatus = (typeof enquiryStatuses)[number];
