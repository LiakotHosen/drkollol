import { z } from 'zod';
import { parseVideoUrl } from '@/lib/video-utils';

/**
 * Sanitizes input string to remove any HTML tags or script elements
 */
function sanitizeText(value: string | undefined): string {
  if (!value) return '';
  return value
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .trim();
}

/**
 * Validates YouTube or Facebook video URL
 */
function isAllowedVideoUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  // Must use secure https protocol
  if (!trimmed.startsWith('https://')) return false;

  const parsed = parseVideoUrl(trimmed);
  return parsed.isValid && (parsed.platform === 'youtube' || parsed.platform === 'facebook');
}

export const galleryVideoSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_\-\.]+$/, { message: 'ID contains invalid characters.' })
    .default(() => 'vid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
  title_en: z
    .string()
    .min(1, { message: 'English title is required.' })
    .max(250, { message: 'English title cannot exceed 250 characters.' })
    .transform(sanitizeText),
  title_bn: z
    .string()
    .min(1, { message: 'Bangla title is required.' })
    .max(250, { message: 'Bangla title cannot exceed 250 characters.' })
    .transform(sanitizeText),
  description_en: z
    .string()
    .max(1500, { message: 'English description cannot exceed 1500 characters.' })
    .optional()
    .transform((val) => sanitizeText(val || '')),
  description_bn: z
    .string()
    .max(1500, { message: 'Bangla description cannot exceed 1500 characters.' })
    .optional()
    .transform((val) => sanitizeText(val || '')),
  video_url: z
    .string()
    .url({ message: 'A valid URL is required.' })
    .refine(isAllowedVideoUrl, {
      message: 'Only verified HTTPS YouTube or Facebook video links are permitted.',
    }),
  video_type: z.enum(['youtube', 'facebook']),
  video_id: z.string().max(100).optional().default(''),
  thumbnail_url: z
    .string()
    .max(500)
    .optional()
    .refine((val) => !val || val.startsWith('https://') || val.startsWith('/'), {
      message: 'Thumbnail URL must be a secure https link or local path.',
    })
    .default(''),
  category: z.string().max(100).optional().default('General'),
  sort_order: z.number().int().min(0).max(9999).default(0),
  is_featured: z.boolean().default(true),
  created_at: z.string().optional(),
});

export type GalleryVideoInput = z.infer<typeof galleryVideoSchema>;
