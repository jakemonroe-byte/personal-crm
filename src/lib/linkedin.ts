/**
 * LinkedIn integration service.
 *
 * LinkedIn's official API requires OAuth 2.0 with approved app credentials.
 * To use this integration:
 *
 * 1. Create a LinkedIn app at https://www.linkedin.com/developers/
 * 2. Request the "Sign In with LinkedIn using OpenID Connect" product
 * 3. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in your .env file
 *
 * For now, this module provides a helper to parse public LinkedIn profile URLs
 * and a structure for storing LinkedIn-sourced data. Full OAuth integration
 * can be added once API credentials are available.
 */

export interface LinkedInProfileData {
  headline: string | null;
  company: string | null;
  title: string | null;
  location: string | null;
  linkedinUrl: string;
}

/**
 * Extract a LinkedIn username from a profile URL.
 */
export function parseLinkedInUrl(url: string): string | null {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/
  );
  return match ? match[1] : null;
}

/**
 * Normalize a LinkedIn URL to a canonical format.
 */
export function normalizeLinkedInUrl(url: string): string | null {
  const username = parseLinkedInUrl(url);
  if (!username) return null;
  return `https://www.linkedin.com/in/${username}`;
}

/**
 * Fetch LinkedIn profile data.
 *
 * This is a placeholder that returns manually-provided data.
 * To enable real fetching, integrate with the LinkedIn API using OAuth 2.0
 * credentials configured in your environment variables.
 */
export async function fetchLinkedInProfile(
  linkedinUrl: string
): Promise<LinkedInProfileData | null> {
  const username = parseLinkedInUrl(linkedinUrl);
  if (!username) return null;

  // Check if LinkedIn API credentials are configured
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.log(
      "LinkedIn API credentials not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in .env to enable profile fetching."
    );
    return null;
  }

  // Placeholder: When OAuth tokens are available, the LinkedIn Profile API
  // (https://api.linkedin.com/v2/me) can be called here.
  // For fetching other users' profiles, the LinkedIn Marketing API or
  // People API with appropriate permissions would be needed.
  return null;
}
