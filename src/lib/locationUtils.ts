// Utility functions for location tracking and geolocation

export interface LocationData {
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

/**
 * Get location data from IP address using a free geolocation service
 */
export async function getLocationFromIP(ip: string): Promise<LocationData | null> {
  try {
    // Use ipapi.co for free IP geolocation (1000 requests/day free)
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    
    if (!response.ok) {
      console.warn('Failed to get location from IP:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    return {
      city: data.city,
      region: data.region,
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone
    };
  } catch (error) {
    console.error('Error getting location from IP:', error);
    return null;
  }
}

/**
 * Format location data into a readable string
 */
export function formatLocation(location: LocationData): string {
  const parts = [];
  
  if (location.city) parts.push(location.city);
  if (location.region) parts.push(location.region);
  if (location.country) parts.push(location.country);
  
  return parts.join(', ') || 'Unknown location';
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || cfConnectingIP || null;
}

/**
 * Get location data for a request (IP-based)
 */
export async function getRequestLocation(request: Request): Promise<LocationData | null> {
  const ip = getClientIP(request);
  
  if (!ip) {
    console.warn('No IP address found in request headers');
    return null;
  }
  
  // Skip localhost/private IPs
  if (ip === '127.0.0.1' || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    console.log('Skipping geolocation for local/private IP:', ip);
    return null;
  }
  
  return await getLocationFromIP(ip);
} 