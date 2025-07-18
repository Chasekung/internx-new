/**
 * Utility function to generate the correct profile link URL based on user type
 * When a company views an intern's profile, it should use /company/public-profile/[id]
 * When an intern views a profile, it should use /public-profile/[id]
 */
export function getProfileLink(internId: string): string {
  if (typeof window === 'undefined') {
    // Server-side rendering - default to intern view
    return `/public-profile/${internId}`;
  }

  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return `/public-profile/${internId}`;
    }

    const user = JSON.parse(userStr);
    if (user.role === 'COMPANY') {
      return `/company/public-profile/${internId}`;
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }

  // Default to intern view
  return `/public-profile/${internId}`;
} 
 * Utility function to generate the correct profile link URL based on user type
 * When a company views an intern's profile, it should use /company/public-profile/[id]
 * When an intern views a profile, it should use /public-profile/[id]
 */
export function getProfileLink(internId: string): string {
  if (typeof window === 'undefined') {
    // Server-side rendering - default to intern view
    return `/public-profile/${internId}`;
  }

  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return `/public-profile/${internId}`;
    }

    const user = JSON.parse(userStr);
    if (user.role === 'COMPANY') {
      return `/company/public-profile/${internId}`;
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }

  // Default to intern view
  return `/public-profile/${internId}`;
} 
 * Utility function to generate the correct profile link URL based on user type
 * When a company views an intern's profile, it should use /company/public-profile/[id]
 * When an intern views a profile, it should use /public-profile/[id]
 */
export function getProfileLink(internId: string): string {
  if (typeof window === 'undefined') {
    // Server-side rendering - default to intern view
    return `/public-profile/${internId}`;
  }

  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return `/public-profile/${internId}`;
    }

    const user = JSON.parse(userStr);
    if (user.role === 'COMPANY') {
      return `/company/public-profile/${internId}`;
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }

  // Default to intern view
  return `/public-profile/${internId}`;
} 
 * Utility function to generate the correct profile link URL based on user type
 * When a company views an intern's profile, it should use /company/public-profile/[id]
 * When an intern views a profile, it should use /public-profile/[id]
 */
export function getProfileLink(internId: string): string {
  if (typeof window === 'undefined') {
    // Server-side rendering - default to intern view
    return `/public-profile/${internId}`;
  }

  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return `/public-profile/${internId}`;
    }

    const user = JSON.parse(userStr);
    if (user.role === 'COMPANY') {
      return `/company/public-profile/${internId}`;
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }

  // Default to intern view
  return `/public-profile/${internId}`;
} 