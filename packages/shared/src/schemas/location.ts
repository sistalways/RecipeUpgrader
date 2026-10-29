import { z } from "zod";

export const MAX_TAVILY_QUERIES = 8;

/**
 * User-supplied location. Either a ZIP code or coordinates, never both
 * required. Coordinates are rounded to ~1km (2 decimal places) before this
 * schema is even applied, so precise location never enters the system
 * (PROJECT.md section 6.7).
 */
export const LocationInputSchema = z
  .object({
    zip: z
      .string()
      .regex(/^\d{5}$/)
      .optional(),
    lat: z.number().min(-90).max(90).optional(),
    lon: z.number().min(-180).max(180).optional(),
  })
  .strict()
  .refine((v) => v.zip !== undefined || (v.lat !== undefined && v.lon !== undefined), {
    message: "Provide either a zip code or both lat and lon",
  });

export type LocationInput = z.infer<typeof LocationInputSchema>;

export const StoreSchema = z
  .object({
    id: z.string().min(1).max(200),
    name: z.string().min(1).max(200),
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    address: z.string().max(300).optional(),
  })
  .strict();

export type Store = z.infer<typeof StoreSchema>;

/**
 * A single ingredient-availability fact, already condensed from raw web
 * content (Tavily, Kroger) before it ever reaches a prompt. See PROJECT.md
 * section 6.3: raw web text never goes into the rewrite prompt.
 */
export const AvailabilitySchema = z
  .object({
    ingredient: z.string().min(1).max(200),
    store: z.string().min(1).max(200),
    available: z.boolean(),
    priceUsd: z.number().nonnegative().optional(),
  })
  .strict();

export type Availability = z.infer<typeof AvailabilitySchema>;
