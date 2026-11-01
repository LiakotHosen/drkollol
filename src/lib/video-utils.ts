export interface ParsedVideo {
  platform: 'youtube' | 'facebook' | 'other';
  videoId?: string;
  embedUrl: string;
  thumbnailUrl: string;
  isValid: boolean;
}

/**
 * Parses YouTube and Facebook video links (standard, unlisted, shorts, reels, share links).
 * Extracts video ID and generates compliant embed URLs and high-resolution thumbnails.
 */
export function parseVideoUrl(url: string): ParsedVideo {
  const trimmed = (url || '').trim();
  if (!trimmed) {
    return {
      platform: 'other',
      embedUrl: '',
      thumbnailUrl: '',
      isValid: false,
    };
  }

  // 1. YouTube Detection
  // Matches:
  // - https://www.youtube.com/watch?v=XXXXXXXXXXX
  // - https://m.youtube.com/watch?v=XXXXXXXXXXX
  // - https://youtu.be/XXXXXXXXXXX
  // - https://www.youtube.com/shorts/XXXXXXXXXXX
  // - https://www.youtube.com/embed/XXXXXXXXXXX
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i
  );

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      platform: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      isValid: true,
    };
  }

  // 2. Facebook Detection
  // Matches facebook.com/... or fb.watch/...
  const isFb = /facebook\.com|fb\.watch/i.test(trimmed);
  if (isFb) {
    const fbEmbed = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
      trimmed
    )}&show_text=0&autoplay=1`;
    return {
      platform: 'facebook',
      embedUrl: fbEmbed,
      // Generic medical/clinical video thumbnail for Facebook when no custom image is supplied
      thumbnailUrl: '/img/doctor-cta-v3.webp',
      isValid: true,
    };
  }

  // 3. Fallback for other video providers
  return {
    platform: 'other',
    embedUrl: trimmed,
    thumbnailUrl: '/img/doctor-cta-v3.webp',
    isValid: Boolean(trimmed),
  };
}
