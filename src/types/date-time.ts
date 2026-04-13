/**
 * A date-only value (no time component).
 * Serialized as VALUE=DATE, e.g. `20260413`.
 */
export interface DateOnly {
  readonly year: number;
  /** Month of the year (1–12) */
  readonly month: number;
  /** Day of the month (1–31) */
  readonly day: number;
}

/**
 * A date-time value without timezone (floating local time).
 * Serialized as `20260413T090000`.
 */
export interface DateTime extends DateOnly {
  /** Hour of the day (0–23) */
  readonly hour: number;
  /** Minute of the hour (0–59) */
  readonly minute: number;
  /** Second of the minute (0–59). Defaults to 0 if omitted. */
  readonly second?: number;
}

/**
 * Any value accepted as a date/time input by builder methods.
 *
 * - `Date` — converted to UTC DATE-TIME (e.g. `20260413T070000Z`)
 * - `string` — treated as ISO 8601, parsed via `new Date()`
 * - `DateOnly` — serialized as VALUE=DATE (e.g. `20260413`)
 * - `DateTime` — serialized as floating DATE-TIME (e.g. `20260413T090000`)
 */
export type DateInput = Date | string | DateOnly | DateTime;

/**
 * Options for date-time properties that support a timezone parameter.
 */
export interface DateTimePropertyOptions {
  /** IANA timezone identifier (e.g. `'Europe/Rome'`). Adds a TZID parameter. */
  readonly tzid?: string;
}
