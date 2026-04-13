/**
 * Immutable RFC 5545 DURATION value object with a fluent builder API.
 *
 * @example
 * ```ts
 * Duration.hours(1).minutes(30).toString() // 'PT1H30M'
 * Duration.days(2).toString()              // 'P2D'
 * Duration.weeks(1).toString()             // 'P1W'
 * Duration.minutes(15).negate().toString() // '-PT15M'
 * ```
 */
export class Duration {
  private constructor(
    private readonly _negative: boolean,
    private readonly _weeks: number,
    private readonly _days: number,
    private readonly _hours: number,
    private readonly _minutes: number,
    private readonly _seconds: number,
  ) {}

  // ──── Static factory methods ────

  /** Create a duration of the given number of weeks. */
  static weeks(n: number): Duration {
    return new Duration(false, n, 0, 0, 0, 0);
  }

  /** Create a duration of the given number of days. */
  static days(n: number): Duration {
    return new Duration(false, 0, n, 0, 0, 0);
  }

  /** Create a duration of the given number of hours. */
  static hours(n: number): Duration {
    return new Duration(false, 0, 0, n, 0, 0);
  }

  /** Create a duration of the given number of minutes. */
  static minutes(n: number): Duration {
    return new Duration(false, 0, 0, 0, n, 0);
  }

  /** Create a duration of the given number of seconds. */
  static seconds(n: number): Duration {
    return new Duration(false, 0, 0, 0, 0, n);
  }

  // ──── Chainable methods (return new Duration) ────

  /** Return a new Duration with the specified weeks added. */
  withWeeks(n: number): Duration {
    return new Duration(this._negative, n, this._days, this._hours, this._minutes, this._seconds);
  }

  /** Return a new Duration with the specified days added. */
  withDays(n: number): Duration {
    return new Duration(this._negative, this._weeks, n, this._hours, this._minutes, this._seconds);
  }

  /** Return a new Duration with the specified hours added. */
  withHours(n: number): Duration {
    return new Duration(this._negative, this._weeks, this._days, n, this._minutes, this._seconds);
  }

  /** Return a new Duration with the specified minutes added. */
  withMinutes(n: number): Duration {
    return new Duration(this._negative, this._weeks, this._days, this._hours, n, this._seconds);
  }

  /** Return a new Duration with the specified seconds added. */
  withSeconds(n: number): Duration {
    return new Duration(this._negative, this._weeks, this._days, this._hours, this._minutes, n);
  }

  /** Return a negated copy of this duration (e.g. for alarm triggers before an event). */
  negate(): Duration {
    return new Duration(
      !this._negative,
      this._weeks,
      this._days,
      this._hours,
      this._minutes,
      this._seconds,
    );
  }

  // ──── Serialization ────

  /**
   * Serialize to RFC 5545 DURATION format.
   *
   * Per the spec, weeks cannot be combined with other date/time components.
   * If weeks is set and no other components are set, outputs `PnW`.
   * Otherwise outputs the day/time components.
   *
   * @example
   * ```
   * 'P1W'       // 1 week
   * 'P2D'       // 2 days
   * 'PT1H30M'   // 1 hour 30 minutes
   * '-PT15M'    // negative 15 minutes
   * 'P1DT2H'    // 1 day 2 hours
   * ```
   */
  toString(): string {
    const sign = this._negative ? '-' : '';
    const hasDateTimeParts = this._days || this._hours || this._minutes || this._seconds;

    // Weeks-only format
    if (this._weeks && !hasDateTimeParts) {
      return `${sign}P${this._weeks}W`;
    }

    let result = `${sign}P`;

    if (this._days) {
      result += `${this._days}D`;
    }

    if (this._hours || this._minutes || this._seconds) {
      result += 'T';
      if (this._hours) result += `${this._hours}H`;
      if (this._minutes) result += `${this._minutes}M`;
      if (this._seconds) result += `${this._seconds}S`;
    }

    // Edge case: all zeros
    if (result === `${sign}P`) {
      result += 'T0S';
    }

    return result;
  }
}
