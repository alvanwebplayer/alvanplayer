/**
 * Validates if a URL points to a valid video file
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is a valid video URL
 */
export const isValidVideoUrl = (url) => {
  if (!url) return false;
  
  try {
    // Check if it's a valid URL
    new URL(url);
    
    // Valid video extensions
    const videoExtensions = ['.mp4', '.mkv', '.webm', '.avi', '.mov', '.flv', '.wmv'];
    
    // Check if URL ends with a valid video extension
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  } catch (e) {
    // Not a valid URL
    return false;
  }
};

/**
 * Extracts a user-friendly title from a video URL
 * @param {string} url - The video URL
 * @returns {string} - Extracted title
 */
export const extractTitleFromUrl = (url) => {
  if (!url) return '';
  
  try {
    // Try to get the filename from the path
    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').pop();
    
    // Remove extension and replace dashes/underscores with spaces
    return filename
      ? decodeURIComponent(filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '))
      : url;
  } catch (e) {
    // If URL parsing fails, return the URL as is
    return url;
  }
}; 