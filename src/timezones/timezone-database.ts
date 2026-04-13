import type { ITimezone } from '../models/timezone.js';
import { TimezoneBuilder, TimezoneRuleBuilder } from '../builders/timezone-builder.js';
import { TIMEZONE_DATABASE } from './data.js';
import type { TimezoneData, TimezoneRuleData } from './data.js';

const cache = new Map<string, ITimezone>();

function buildRule(type: 'STANDARD' | 'DAYLIGHT', data: TimezoneRuleData) {
  const builder = new TimezoneRuleBuilder(type)
    .start(data.dtstart)
    .offsetFrom(data.offsetFrom)
    .offsetTo(data.offsetTo)
    .tzName(data.tzName);
  if (data.rrule) {
    builder.rrule(data.rrule);
  }
  return builder.build();
}

function buildTimezone(data: TimezoneData): ITimezone {
  const builder = new TimezoneBuilder()
    .tzId(data.id)
    .standard(buildRule('STANDARD', data.standard));
  if (data.daylight) {
    builder.daylight(buildRule('DAYLIGHT', data.daylight));
  }
  return builder.build();
}

/**
 * Pre-built IANA timezone database.
 *
 * Provides factory methods to get `ITimezone` components for ~80 common
 * timezones without manually building VTIMEZONE definitions.
 *
 * @example
 * ```ts
 * import { Timezone, CalendarBuilder } from 'ical-ts';
 *
 * // Get a single timezone
 * const rome = Timezone.get('Europe/Rome');
 *
 * // Add to calendar
 * new CalendarBuilder()
 *   .prodId('-//MyApp//EN')
 *   .timezone(rome)
 *   .event(event)
 *   .build();
 *
 * // List all available timezone IDs
 * Timezone.availableIds(); // ['Africa/Accra', 'Africa/Addis_Ababa', ...]
 * ```
 */
export class Timezone {
  private constructor() {}

  /**
   * Get a pre-built `ITimezone` for the given IANA timezone identifier.
   *
   * Results are cached — calling `get()` twice with the same ID returns
   * the same object.
   *
   * @param id - IANA timezone identifier (e.g. `'Europe/Rome'`, `'America/New_York'`).
   * @throws {Error} if the timezone is not in the built-in database.
   *   Use `Timezone.has()` to check first, or build custom timezones with `TimezoneBuilder`.
   */
  static get(id: string): ITimezone {
    const cached = cache.get(id);
    if (cached) return cached;

    const data = TIMEZONE_DATABASE.find((tz) => tz.id === id);
    if (!data) {
      throw new Error(
        `Unknown timezone: '${id}'. Use Timezone.availableIds() to list supported zones, ` +
        `or build a custom VTIMEZONE with TimezoneBuilder.`,
      );
    }

    const tz = buildTimezone(data);
    cache.set(id, tz);
    return tz;
  }

  /**
   * Check if a timezone ID is available in the built-in database.
   */
  static has(id: string): boolean {
    return TIMEZONE_DATABASE.some((tz) => tz.id === id);
  }

  /**
   * List all available timezone IDs, sorted alphabetically.
   */
  static availableIds(): string[] {
    return TIMEZONE_DATABASE.map((tz) => tz.id).sort();
  }
}
