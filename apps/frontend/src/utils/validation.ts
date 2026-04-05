/**
 * Shared validation & sanitization utilities.
 * Prevents XSS, SQL injection, and script injection on the frontend.
 */

// Dangerous patterns: script tags, SQL keywords, JS event handlers
const DANGEROUS_PATTERNS = [
  /<script[\s>]/i,
  /<\/script>/i,
  /javascript:/i,
  /on\w+\s*=/i, // onclick=, onerror=, etc.
  /\b(DROP|DELETE|INSERT|UPDATE|ALTER|EXEC|UNION|SELECT)\b.*\b(TABLE|FROM|INTO|SET|WHERE)\b/i,
  /['";].*--/, // SQL comment injection
  /\bOR\b\s+\b\d+\b\s*=\s*\b\d+\b/i, // OR 1=1
];

/** Check if string contains dangerous patterns */
export function hasDangerousContent(value: string): boolean {
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(value));
}

/** Sanitize string — strip HTML tags */
export function sanitize(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim();
}

/** Validate required field */
export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) return `${fieldName} is required`;
  return null;
}

/** Validate min length */
export function validateMinLength(value: string, min: number, fieldName: string): string | null {
  if (value.trim().length < min) return `${fieldName} must be at least ${min} characters`;
  return null;
}

/** Validate max length */
export function validateMaxLength(value: string, max: number, fieldName: string): string | null {
  if (value.trim().length > max) return `${fieldName} must be ${max} characters or less`;
  return null;
}

/** Validate field — returns first error or null */
export function validateField(
  value: string,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    fieldName: string;
  }
): string | null {
  const { required, minLength, maxLength, fieldName } = rules;

  if (required && !value.trim()) return `${fieldName} is required`;
  if (!value.trim()) return null; // optional and empty — OK

  if (hasDangerousContent(value)) return `${fieldName} contains invalid characters`;
  if (minLength && value.trim().length < minLength)
    return `${fieldName} must be at least ${minLength} characters`;
  if (maxLength && value.trim().length > maxLength)
    return `${fieldName} must be ${maxLength} characters or less`;

  return null;
}
