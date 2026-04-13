import type { Frequency, Weekday } from '../types/enums.js';
import type { DateInput } from '../types/date-time.js';
import { normalizeDateInput } from '../util/date.js';

/**
 * A day-of-week value for BYDAY, optionally prefixed with an ordinal.
 * Examples: `'MO'`, `'2TU'` (second Tuesday), `'-1FR'` (last Friday).
 */
export type ByDayValue = Weekday | `${number}${Weekday}`;

/**
 * Fluent builder for RFC 5545 recurrence rules (RRULE).
 *
 * @example
 * ```ts
 * new RRuleBuilder()
 *   .freq('WEEKLY')
 *   .byDay('MO', 'WE', 'FR')
 *   .count(52)
 *   .toString()
 * // 'FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=52'
 * ```
 */
export class RRuleBuilder {
  private _freq?: Frequency;
  private _until?: string;
  private _count?: number;
  private _interval?: number;
  private _bySecond?: number[];
  private _byMinute?: number[];
  private _byHour?: number[];
  private _byDay?: ByDayValue[];
  private _byMonthDay?: number[];
  private _byYearDay?: number[];
  private _byWeekNo?: number[];
  private _byMonth?: number[];
  private _bySetPos?: number[];
  private _weekStart?: Weekday;

  /** Set the recurrence frequency (required). */
  freq(f: Frequency): this {
    this._freq = f;
    return this;
  }

  /** Set the recurrence end date. Mutually exclusive with `count()`. */
  until(d: DateInput): this {
    const normalized = normalizeDateInput(d);
    this._until = normalized.value;
    return this;
  }

  /** Set the maximum number of occurrences. Mutually exclusive with `until()`. */
  count(n: number): this {
    this._count = n;
    return this;
  }

  /** Set the interval between recurrences (default: 1). */
  interval(n: number): this {
    this._interval = n;
    return this;
  }

  /** Limit recurrence by second (0–60). */
  bySecond(...seconds: number[]): this {
    this._bySecond = (this._bySecond ?? []).concat(seconds);
    return this;
  }

  /** Limit recurrence by minute (0–59). */
  byMinute(...minutes: number[]): this {
    this._byMinute = (this._byMinute ?? []).concat(minutes);
    return this;
  }

  /** Limit recurrence by hour (0–23). */
  byHour(...hours: number[]): this {
    this._byHour = (this._byHour ?? []).concat(hours);
    return this;
  }

  /**
   * Limit recurrence by day of week, optionally with an ordinal prefix.
   * @example byDay('MO', 'WE', 'FR')     // every Mon, Wed, Fri
   * @example byDay('2TU')                 // second Tuesday
   * @example byDay('-1FR')                // last Friday
   */
  byDay(...days: ByDayValue[]): this {
    this._byDay = (this._byDay ?? []).concat(days);
    return this;
  }

  /** Limit recurrence by day of month (1–31 or -31–-1). */
  byMonthDay(...days: number[]): this {
    this._byMonthDay = (this._byMonthDay ?? []).concat(days);
    return this;
  }

  /** Limit recurrence by day of year (1–366 or -366–-1). */
  byYearDay(...days: number[]): this {
    this._byYearDay = (this._byYearDay ?? []).concat(days);
    return this;
  }

  /** Limit recurrence by week number (1–53 or -53–-1). */
  byWeekNo(...weeks: number[]): this {
    this._byWeekNo = (this._byWeekNo ?? []).concat(weeks);
    return this;
  }

  /** Limit recurrence by month (1–12). */
  byMonth(...months: number[]): this {
    this._byMonth = (this._byMonth ?? []).concat(months);
    return this;
  }

  /** Filter the recurrence set by position within the set. */
  bySetPos(...positions: number[]): this {
    this._bySetPos = (this._bySetPos ?? []).concat(positions);
    return this;
  }

  /** Set the day the work week starts (default: MO). */
  weekStart(day: Weekday): this {
    this._weekStart = day;
    return this;
  }

  /**
   * Build the RRULE value string.
   * @throws {Error} if `freq` is not set or if both `until` and `count` are set.
   */
  build(): string {
    if (!this._freq) {
      throw new Error('RRuleBuilder: FREQ is required');
    }
    if (this._until !== undefined && this._count !== undefined) {
      throw new Error('RRuleBuilder: UNTIL and COUNT are mutually exclusive');
    }

    const parts: string[] = [`FREQ=${this._freq}`];

    if (this._until !== undefined) parts.push(`UNTIL=${this._until}`);
    if (this._count !== undefined) parts.push(`COUNT=${this._count}`);
    if (this._interval !== undefined) parts.push(`INTERVAL=${this._interval}`);
    if (this._bySecond?.length) parts.push(`BYSECOND=${this._bySecond.join(',')}`);
    if (this._byMinute?.length) parts.push(`BYMINUTE=${this._byMinute.join(',')}`);
    if (this._byHour?.length) parts.push(`BYHOUR=${this._byHour.join(',')}`);
    if (this._byDay?.length) parts.push(`BYDAY=${this._byDay.join(',')}`);
    if (this._byMonthDay?.length) parts.push(`BYMONTHDAY=${this._byMonthDay.join(',')}`);
    if (this._byYearDay?.length) parts.push(`BYYEARDAY=${this._byYearDay.join(',')}`);
    if (this._byWeekNo?.length) parts.push(`BYWEEKNO=${this._byWeekNo.join(',')}`);
    if (this._byMonth?.length) parts.push(`BYMONTH=${this._byMonth.join(',')}`);
    if (this._bySetPos?.length) parts.push(`BYSETPOS=${this._bySetPos.join(',')}`);
    if (this._weekStart !== undefined) parts.push(`WKST=${this._weekStart}`);

    return parts.join(';');
  }

  /** Alias for `build()`. */
  toString(): string {
    return this.build();
  }
}
