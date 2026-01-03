/**
 * Profile Completeness Calculator
 * Dynamically calculates profile completion percentage based on filled fields.
 */

export interface ProfileData {
  fullName?: string;
  email?: string;
  username?: string;
  phoneNumber?: string;
  address?: string;
  state?: string;
  highSchool?: string;
  gradeLevel?: string;
  age?: string;
  skills?: string;
  experience?: string;
  extracurriculars?: string;
  achievements?: string;
  careerInterests?: string;
  resumeUrl?: string;
  bio?: string;
  headline?: string;
  interests?: string;
  languages?: string;
  certifications?: string[];
  profilePhotoUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

// Define which fields count towards profile completion and their weights
// Higher weight = more important for profile completeness
const PROFILE_FIELDS: { key: keyof ProfileData; weight: number; label: string }[] = [
  // Core identity fields (weight: 2)
  { key: 'fullName', weight: 2, label: 'Full Name' },
  { key: 'email', weight: 2, label: 'Email' },
  { key: 'username', weight: 2, label: 'Username' },
  
  // Important profile fields (weight: 1.5)
  { key: 'bio', weight: 1.5, label: 'Bio' },
  { key: 'skills', weight: 1.5, label: 'Skills' },
  { key: 'careerInterests', weight: 1.5, label: 'Career Interests' },
  { key: 'highSchool', weight: 1.5, label: 'High School' },
  { key: 'gradeLevel', weight: 1.5, label: 'Grade Level' },
  
  // Standard profile fields (weight: 1)
  { key: 'headline', weight: 1, label: 'Headline' },
  { key: 'phoneNumber', weight: 1, label: 'Phone Number' },
  { key: 'address', weight: 1, label: 'Location' },
  { key: 'state', weight: 1, label: 'State' },
  { key: 'age', weight: 1, label: 'Age' },
  { key: 'experience', weight: 1, label: 'Experience' },
  { key: 'extracurriculars', weight: 1, label: 'Extracurriculars' },
  { key: 'achievements', weight: 1, label: 'Achievements' },
  { key: 'interests', weight: 1, label: 'Interests' },
  { key: 'languages', weight: 1, label: 'Languages' },
  
  // Optional but valuable fields (weight: 0.5)
  { key: 'profilePhotoUrl', weight: 0.5, label: 'Profile Photo' },
  { key: 'resumeUrl', weight: 0.5, label: 'Resume' },
  { key: 'linkedinUrl', weight: 0.5, label: 'LinkedIn' },
  { key: 'githubUrl', weight: 0.5, label: 'GitHub' },
  { key: 'portfolioUrl', weight: 0.5, label: 'Portfolio' },
];

/**
 * Check if a field has a meaningful value
 */
function isFieldFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export interface ProfileCompletenessResult {
  percentage: number;
  filledFields: string[];
  missingFields: string[];
  totalWeight: number;
  filledWeight: number;
}

/**
 * Calculate the profile completion percentage
 * @param profile - The user's profile data
 * @returns Object containing percentage and field details
 */
export function calculateProfileCompleteness(profile: ProfileData): ProfileCompletenessResult {
  let filledWeight = 0;
  let totalWeight = 0;
  const filledFields: string[] = [];
  const missingFields: string[] = [];

  for (const field of PROFILE_FIELDS) {
    totalWeight += field.weight;
    
    if (isFieldFilled(profile[field.key])) {
      filledWeight += field.weight;
      filledFields.push(field.label);
    } else {
      missingFields.push(field.label);
    }
  }

  const percentage = totalWeight > 0 ? Math.round((filledWeight / totalWeight) * 100) : 0;

  return {
    percentage,
    filledFields,
    missingFields,
    totalWeight,
    filledWeight,
  };
}

/**
 * Check if profile meets the minimum completion requirement
 * @param profile - The user's profile data
 * @param minimumPercentage - Minimum required percentage (default: 50)
 * @returns boolean indicating if requirement is met
 */
export function meetsProfileRequirement(profile: ProfileData, minimumPercentage: number = 50): boolean {
  const { percentage } = calculateProfileCompleteness(profile);
  return percentage >= minimumPercentage;
}

/**
 * Get a user-friendly message about profile completion status
 */
export function getProfileCompletionMessage(profile: ProfileData, minimumPercentage: number = 50): string {
  const { percentage, missingFields } = calculateProfileCompleteness(profile);
  
  if (percentage >= minimumPercentage) {
    return `Your profile is ${percentage}% complete. You have access to all features!`;
  }
  
  const topMissing = missingFields.slice(0, 3).join(', ');
  return `Your profile is ${percentage}% complete. Complete at least ${minimumPercentage}% to access interviews. Consider adding: ${topMissing}`;
}

