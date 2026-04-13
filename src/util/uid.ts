/**
 * Generate an RFC 5545 compliant unique identifier.
 * Uses `crypto.randomUUID()` where available, with a fallback
 * to timestamp + random hex for older environments.
 */
export function generateUid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random hex
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `${timestamp}-${random}`;
}
