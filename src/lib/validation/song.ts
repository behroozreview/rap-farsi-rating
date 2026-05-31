import { z } from "zod";

const optionalUrlSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  },
  z.url().max(500).optional()
);

export const songSchema = z.object({
  title: z.string().trim().min(2).max(200),
  artist: z.string().trim().max(120).optional().default(""),
  url: optionalUrlSchema,
  rating: z.coerce.number().int().min(0).max(9),
  persianYear: z.coerce.number().int().min(1350).max(1499),
  notes: z.string().trim().max(1000).optional(),
});

export const songPatchSchema = songSchema.partial();

export const csvSongSchema = z.object({
  title: z.string().trim().min(2).max(200),
  artist: z.string().trim().max(120).optional().default(""),
  url: optionalUrlSchema,
  rating: z.coerce.number().int().min(0).max(9),
  persianYear: z.coerce.number().int().min(1350).max(1499),
});

export type SongInput = z.infer<typeof songSchema>;
export type SongPatchInput = z.infer<typeof songPatchSchema>;
export type CsvSongInput = z.infer<typeof csvSongSchema>;
