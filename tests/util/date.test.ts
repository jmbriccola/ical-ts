import {
  isDateOnly,
  isDateTime,
  formatDate,
  formatDateTime,
  formatDateUTC,
  normalizeDateInput,
} from '../../src/util/date.js';

describe('isDateOnly', () => {
  it('returns true for DateOnly objects', () => {
    expect(isDateOnly({ year: 2026, month: 4, day: 13 })).toBe(true);
  });

  it('returns false for DateTime objects', () => {
    expect(isDateOnly({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })).toBe(false);
  });

  it('returns false for Date objects', () => {
    expect(isDateOnly(new Date())).toBe(false);
  });

  it('returns false for strings', () => {
    expect(isDateOnly('2026-04-13')).toBe(false);
  });
});

describe('isDateTime', () => {
  it('returns true for DateTime objects', () => {
    expect(isDateTime({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })).toBe(true);
  });

  it('returns true for DateTime with seconds', () => {
    expect(isDateTime({ year: 2026, month: 4, day: 13, hour: 9, minute: 0, second: 30 })).toBe(true);
  });

  it('returns false for DateOnly objects', () => {
    expect(isDateTime({ year: 2026, month: 4, day: 13 })).toBe(false);
  });
});

describe('formatDate', () => {
  it('formats a date correctly', () => {
    expect(formatDate({ year: 2026, month: 4, day: 13 })).toBe('20260413');
  });

  it('pads single-digit months and days', () => {
    expect(formatDate({ year: 2026, month: 1, day: 5 })).toBe('20260105');
  });
});

describe('formatDateTime', () => {
  it('formats date-time correctly', () => {
    expect(formatDateTime({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 }))
      .toBe('20260413T090000');
  });

  it('formats date-time with seconds', () => {
    expect(formatDateTime({ year: 2026, month: 4, day: 13, hour: 14, minute: 30, second: 45 }))
      .toBe('20260413T143045');
  });

  it('defaults seconds to 0', () => {
    expect(formatDateTime({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 }))
      .toBe('20260413T090000');
  });
});

describe('formatDateUTC', () => {
  it('formats a UTC Date to iCal format', () => {
    const d = new Date('2026-04-13T07:00:00Z');
    expect(formatDateUTC(d)).toBe('20260413T070000Z');
  });
});

describe('normalizeDateInput', () => {
  it('normalizes DateOnly', () => {
    const result = normalizeDateInput({ year: 2026, month: 4, day: 13 });
    expect(result).toEqual({ value: '20260413', isDateOnly: true, isUtc: false });
  });

  it('normalizes DateTime', () => {
    const result = normalizeDateInput({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 });
    expect(result).toEqual({ value: '20260413T090000', isDateOnly: false, isUtc: false });
  });

  it('normalizes Date object to UTC', () => {
    const result = normalizeDateInput(new Date('2026-04-13T07:00:00Z'));
    expect(result).toEqual({ value: '20260413T070000Z', isDateOnly: false, isUtc: true });
  });

  it('normalizes ISO string to UTC', () => {
    const result = normalizeDateInput('2026-04-13T07:00:00Z');
    expect(result).toEqual({ value: '20260413T070000Z', isDateOnly: false, isUtc: true });
  });
});
