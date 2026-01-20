/**
 * CloudFront URL Helper
 * Transforms S3 URLs to CloudFront URLs for optimal image loading
 */

const CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || 'd2cjbd1iqkwr9j.cloudfront.net';

/**
 * Transforms any image URL to CloudFront URL
 * Handles: S3 URLs, relative paths, existing CloudFront URLs
 */
export function getCloudFrontUrl(url: string | null | undefined): string {
  if (!url) return '';

  // Already a CloudFront URL
  if (url.includes(CLOUDFRONT_DOMAIN)) {
    return url;
  }

  let imagePath = '';

  if (url.startsWith('http')) {
    // Extract path from full URL
    try {
      const urlObj = new URL(url);
      const rawPath = urlObj.pathname.startsWith('/')
        ? urlObj.pathname.substring(1)
        : urlObj.pathname;
      imagePath = rawPath
        .replace(/^api\/v1\/images\/view\//, '')
        .replace(/^images\/view\//, '');
    } catch {
      // Try to extract path manually
      const match = url.match(/\/(memes|user-uploads)\/.+/);
      if (match) {
        imagePath = match[0].substring(1);
      } else {
        return url; // Return original if can't parse
      }
    }
  } else {
    // Relative path
    imagePath = url.startsWith('/') ? url.substring(1) : url;
  }

  return `https://${CLOUDFRONT_DOMAIN}/${imagePath}`;
}

/**
 * Transform array of objects with url property
 */
export function transformImageUrls<T extends { url: string }>(items: T[]): T[] {
  return items.map(item => ({
    ...item,
    url: getCloudFrontUrl(item.url),
  }));
}

