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
 * Enforces strict HTTPS and prevents script or protocol injection.
 */
export function parseVideoUrl(url: string): ParsedVideo {
  const trimmed = (url || '').trim();
  if (!trimmed || !/^https?:\/\//i.test(trimmed)) {
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
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([\w-]{11})/i
  );

  if (ytMatch && ytMatch[1]) {
    const rawId = ytMatch[1];
    // Clean and strictly alphanumeric/dash/underscore
    const videoId = encodeURIComponent(rawId);
    return {
      platform: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      isValid: true,
    };
  }

  // 2. Facebook Detection
  // Matches facebook.com/... or fb.watch/...
  const isFb = /^https:\/\/(?:[a-zA-Z0-9-]+\.)?(?:facebook\.com|fb\.watch)\/.+/i.test(trimmed);
  if (isFb) {
    const fbEmbed = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
      trimmed
    )}&show_text=0`;
    return {
      platform: 'facebook',
      embedUrl: fbEmbed,
      // Generic medical/clinical video thumbnail for Facebook when no custom image is supplied
      thumbnailUrl: '/img/doctor-cta-v3.webp',
      isValid: true,
    };
  }

  // 3. Fallback for unsupported or unverified URLs - marked invalid for security
  return {
    platform: 'other',
    embedUrl: '',
    thumbnailUrl: '/img/doctor-cta-v3.webp',
    isValid: false,
  };
}
