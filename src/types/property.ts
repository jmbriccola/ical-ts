/**
 * Key-value map of iCalendar property parameters.
 * Values can be a single string or an array of strings (for multi-valued params).
 */
export interface PropertyParameters {
  readonly [key: string]: string | string[] | undefined;
}

/**
 * A single iCalendar property with its name, value, and optional parameters.
 *
 * Example: `DTSTART;TZID=Europe/Rome:20260413T090000`
 * - name: `'DTSTART'`
 * - value: `'20260413T090000'`
 * - parameters: `{ TZID: 'Europe/Rome' }`
 */
export interface Property {
  readonly name: string;
  readonly value: string;
  readonly parameters: PropertyParameters;
}
