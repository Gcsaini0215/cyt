// Small, cached thumbnails of uploaded therapist photos via Next's image optimizer
// (/_next/image, allowed hosts in next.config.js). Photos are uploaded full size —
// often 1000px+ and ~150 KB — but cards show them at 80–240px.
// w must be one of Next's sizes: 64 96 128 256 384 640 750 828 1080 …

export const thumb = (src, w = 256, q = 70) =>
  src && /^https?:\/\//.test(src) ? `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${q}` : src;

// srcSet for 1x / 2x screens
export const thumbSet = (src, w1, w2) =>
  src && /^https?:\/\//.test(src) ? `${thumb(src, w1)} 1x, ${thumb(src, w2)} 2x` : undefined;
