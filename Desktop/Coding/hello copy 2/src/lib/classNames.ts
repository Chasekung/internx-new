/**
 * Utility function to conditionally join class names together
 * @param classes - Array of class names or objects with boolean values
 * @returns Combined class string
 */
export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
} 