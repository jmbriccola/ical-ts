import type { DateInput, DateOnly, DateTime } from '../types/date-time.js';

/** Type guard: returns true if the input is a DateOnly (has year/month/day but no hour). */
export function isDateOnly(input: DateInput): input is DateOnly {
  return (
    typeof input === 'object' &&
    !(input instanceof Date) &&
    'year' in input &&
    'month' in input &&
    'day' in input &&
    !('hour' in input)
  );
}

/** Type guard: returns true if the input is a DateTime (has year/month/day/hour). */
export function isDateTime(input: DateInput): input is DateTime {
  return (
    typeof input === 'object' &&
    !(input instanceof Date) &&
    'year' in input &&
    'month' in input &&
    'day' in input &&
    'hour' in input
  );
}

/** Pad a number to the specified width with leading zeros. */
function pad(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

/**
 * Format a DateOnly to an iCal DATE string.
 * @example formatDate({ year: 2026, month: 4, day: 13 }) // '20260413'
 */
export function formatDate(d: DateOnly): string {
  return `${pad(d.year, 4)}${pad(d.month, 2)}${pad(d.day, 2)}`;
}

/**
 * Format a DateTime to an iCal DATE-TIME string (no trailing Z).
 * @example formatDateTime({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 }) // '20260413T090000'
 */
export function formatDateTime(d: DateTime): string {
  return `${formatDate(d)}T${pad(d.hour, 2)}${pad(d.minute, 2)}${pad(d.second ?? 0, 2)}`;
}

/**
 * Format a native Date object to an iCal UTC DATE-TIME string.
 * @example formatDateUTC(new Date('2026-04-13T07:00:00Z')) // '20260413T070000Z'
 */
export function formatDateUTC(d: Date): string {
  return (
    `${pad(d.getUTCFullYear(), 4)}${pad(d.getUTCMonth() + 1, 2)}${pad(d.getUTCDate(), 2)}` +
    `T${pad(d.getUTCHours(), 2)}${pad(d.getUTCMinutes(), 2)}${pad(d.getUTCSeconds(), 2)}Z`
  );
}

/**
 * Result of normalizing a DateInput value.
 */
export interface NormalizedDate {
  /** The formatted iCal date or date-time string. */
  readonly value: string;
  /** True if this is a date-only value (no time component). */
  readonly isDateOnly: boolean;
  /** True if the value is in UTC (ends with Z). */
  readonly isUtc: boolean;
}

/**
 * Normalize any DateInput to a formatted string with metadata.
 *
 * - `DateOnly` → DATE format (`20260413`), isDateOnly=true
 * - `DateTime` → DATE-TIME format (`20260413T090000`), isDateOnly=false, isUtc=false
 * - `Date` → UTC DATE-TIME format (`20260413T070000Z`), isDateOnly=false, isUtc=true
 * - `string` → parsed as ISO 8601 via `new Date()`, then formatted as UTC
 */
export function normalizeDateInput(input: DateInput): NormalizedDate {
  if (isDateOnly(input)) {
    return { value: formatDate(input), isDateOnly: true, isUtc: false };
  }

  if (isDateTime(input)) {
    return { value: formatDateTime(input), isDateOnly: false, isUtc: false };
  }

  const date = typeof input === 'string' ? new Date(input) : input;
  return { value: formatDateUTC(date), isDateOnly: false, isUtc: true };
}
