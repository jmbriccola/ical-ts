import { Duration } from '../../src/duration/duration.js';

describe('Duration', () => {
  it('creates weeks-only duration', () => {
    expect(Duration.weeks(1).toString()).toBe('P1W');
  });

  it('creates days duration', () => {
    expect(Duration.days(2).toString()).toBe('P2D');
  });

  it('creates hours duration', () => {
    expect(Duration.hours(3).toString()).toBe('PT3H');
  });

  it('creates minutes duration', () => {
    expect(Duration.minutes(30).toString()).toBe('PT30M');
  });

  it('creates seconds duration', () => {
    expect(Duration.seconds(45).toString()).toBe('PT45S');
  });

  it('chains hours and minutes', () => {
    expect(Duration.hours(1).withMinutes(30).toString()).toBe('PT1H30M');
  });

  it('chains days and hours', () => {
    expect(Duration.days(1).withHours(2).toString()).toBe('P1DT2H');
  });

  it('chains days, hours, minutes, seconds', () => {
    expect(
      Duration.days(1).withHours(2).withMinutes(30).withSeconds(15).toString()
    ).toBe('P1DT2H30M15S');
  });

  it('negates a duration', () => {
    expect(Duration.minutes(15).negate().toString()).toBe('-PT15M');
  });

  it('double negate returns positive', () => {
    expect(Duration.minutes(15).negate().negate().toString()).toBe('PT15M');
  });

  it('produces PT0S for zero duration', () => {
    // Edge case: all-zero duration (starting from days(0))
    expect(Duration.days(0).toString()).toBe('PT0S');
  });

  it('weeks with other components outputs non-week format', () => {
    // Per RFC 5545, weeks cannot be combined with other components
    expect(Duration.weeks(1).withDays(2).toString()).toBe('P2D');
  });

  it('is immutable - chaining returns new instance', () => {
    const a = Duration.hours(1);
    const b = a.withMinutes(30);
    expect(a.toString()).toBe('PT1H');
    expect(b.toString()).toBe('PT1H30M');
  });
});
