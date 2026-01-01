import { PUBLIC_R2_CDN_URL } from '$env/static/public';

/**
 * Get the R2 CDN URL for a file path
 * @param {string} filePath - The relative path to the file (e.g., "/episode-1.mp3")
 * @returns {string} - The full R2 CDN URL or the original path if R2 is not configured
 */
export function getR2Url(filePath) {
	// Remove leading slash if present
	const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;

	// Get R2 CDN URL from environment variable
	// In production, this should be set to your R2 public bucket URL or custom domain
	// Example: https://your-bucket.r2.dev or https://cdn.yourdomain.com
	const r2CdnUrl = PUBLIC_R2_CDN_URL;

	if (r2CdnUrl) {
		// Ensure R2 URL doesn't have trailing slash
		const baseUrl = r2CdnUrl.endsWith('/') ? r2CdnUrl.slice(0, -1) : r2CdnUrl;
		return `${baseUrl}/${cleanPath}`;
	}

	// Fallback to original path if R2 is not configured (for local development)
	return filePath;
}
