import { z } from "zod";
import { isAllowedImageSource, imageSourceMessage } from "@/lib/imageHosts";

// Each admin page submits its whole list as one JSON array (via
// RepeatableRows' hidden input) - these validate the parsed array, not a
// single row, since the Server Action replaces the entire table in one go.

export const serviceCategoryRowSchema = z.object({
  icon: z.string().trim().min(1, "Pick an icon."),
  label: z.string().trim().min(1, "Label is required."),
  desc: z.string().trim().min(1, "Description is required."),
  image: z.string().trim().min(1, "Image is required.").refine(isAllowedImageSource, imageSourceMessage),
});
export const serviceCategoriesSchema = z.array(serviceCategoryRowSchema).min(1, "Add at least one category.");

export const trustLogoRowSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  category: z.string().trim().min(1, "Category is required."),
  logo: z.string().trim().min(1, "Logo URL/path is required.").refine(isAllowedImageSource, imageSourceMessage),
});
export const trustLogosSchema = z.array(trustLogoRowSchema).min(1, "Add at least one logo.");

export const uspRowSchema = z.object({
  icon: z.string().trim().min(1, "Pick an icon."),
  title: z.string().trim().min(1, "Title is required."),
  desc: z.string().trim().min(1, "Description is required."),
});
export const uspsSchema = z.array(uspRowSchema).min(1, "Add at least one item.");
