import { Timezone } from '../../src/timezones/timezone-database.js';
import { CalendarBuilder } from '../../src/builders/calendar-builder.js';
import { EventBuilder } from '../../src/builders/event-builder.js';
import { TodoBuilder } from '../../src/builders/todo-builder.js';

describe('Timezone.get()', () => {
  it('returns a valid ITimezone for Europe/Rome', () => {
    const tz = Timezone.get('Europe/Rome');
    const output = tz.toString();
    expect(output).toContain('BEGIN:VTIMEZONE');
    expect(output).toContain('TZID:Europe/Rome');
    expect(output).toContain('BEGIN:STANDARD');
    expect(output).toContain('TZNAME:CET');
    expect(output).toContain('BEGIN:DAYLIGHT');
    expect(output).toContain('TZNAME:CEST');
    expect(output).toContain('TZOFFSETFROM:+0200');
    expect(output).toContain('TZOFFSETTO:+0100');
    expect(output).toContain('END:VTIMEZONE');
  });

  it('returns a valid ITimezone for America/New_York', () => {
    const tz = Timezone.get('America/New_York');
    const output = tz.toString();
    expect(output).toContain('TZID:America/New_York');
    expect(output).toContain('TZNAME:EST');
    expect(output).toContain('TZNAME:EDT');
    expect(output).toContain('TZOFFSETFROM:-0400');
    expect(output).toContain('TZOFFSETTO:-0500');
  });

  it('returns a timezone without DST (Asia/Tokyo)', () => {
    const tz = Timezone.get('Asia/Tokyo');
    const output = tz.toString();
    expect(output).toContain('TZID:Asia/Tokyo');
    expect(output).toContain('TZNAME:JST');
    expect(output).toContain('TZOFFSETTO:+0900');
    expect(output).not.toContain('BEGIN:DAYLIGHT');
  });

  it('returns UTC', () => {
    const tz = Timezone.get('UTC');
    const output = tz.toString();
    expect(output).toContain('TZID:UTC');
    expect(output).toContain('TZOFFSETTO:+0000');
  });

  it('caches results (same reference)', () => {
    const a = Timezone.get('Europe/Berlin');
    const b = Timezone.get('Europe/Berlin');
    expect(a).toBe(b);
  });

  it('throws for unknown timezone', () => {
    expect(() => Timezone.get('Fake/Zone')).toThrow('Unknown timezone');
  });
});

describe('Timezone.has()', () => {
  it('returns true for known timezone', () => {
    expect(Timezone.has('Europe/Rome')).toBe(true);
    expect(Timezone.has('Asia/Kolkata')).toBe(true);
  });

  it('returns false for unknown timezone', () => {
    expect(Timezone.has('Mars/Olympus')).toBe(false);
  });
});

describe('Timezone.availableIds()', () => {
  it('returns a sorted array', () => {
    const ids = Timezone.availableIds();
    expect(ids.length).toBeGreaterThan(70);
    const sorted = [...ids].sort();
    expect(ids).toEqual(sorted);
  });

  it('includes major timezones', () => {
    const ids = Timezone.availableIds();
    expect(ids).toContain('Europe/Rome');
    expect(ids).toContain('America/New_York');
    expect(ids).toContain('Asia/Tokyo');
    expect(ids).toContain('Australia/Sydney');
    expect(ids).toContain('Africa/Cairo');
    expect(ids).toContain('UTC');
  });
});

describe('CalendarBuilder.autoTimezones()', () => {
  it('auto-adds timezone for TZID in event', () => {
    const event = new EventBuilder()
      .uid('e1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start(
        { year: 2026, month: 4, day: 13, hour: 9, minute: 0 },
        { tzid: 'Europe/Rome' },
      )
      .build();

    const cal = new CalendarBuilder()
      .prodId('-//Test//EN')
      .event(event)
      .autoTimezones()
      .build();

    const output = cal.toString();
    expect(output).toContain('BEGIN:VTIMEZONE');
    expect(output).toContain('TZID:Europe/Rome');
  });

  it('auto-adds multiple timezones', () => {
    const event1 = new EventBuilder()
      .uid('e1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 }, { tzid: 'Europe/Rome' })
      .build();

    const event2 = new EventBuilder()
      .uid('e2')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 }, { tzid: 'America/New_York' })
      .build();

    const cal = new CalendarBuilder()
      .prodId('-//Test//EN')
      .event(event1)
      .event(event2)
      .autoTimezones()
      .build();

    const output = cal.toString();
    expect(output).toContain('TZID:Europe/Rome');
    expect(output).toContain('TZID:America/New_York');
  });

  it('does not duplicate already-added timezones', () => {
    const event = new EventBuilder()
      .uid('e1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 }, { tzid: 'Europe/Rome' })
      .build();

    const cal = new CalendarBuilder()
      .prodId('-//Test//EN')
      .timezone(Timezone.get('Europe/Rome'))
      .event(event)
      .autoTimezones()
      .build();

    const output = cal.toString();
    const matches = output.match(/TZID:Europe\/Rome/g);
    expect(matches).toHaveLength(1);
  });

  it('skips unknown timezone IDs silently', () => {
    const event = new EventBuilder()
      .uid('e1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 }, { tzid: 'Custom/Zone' })
      .build();

    const cal = new CalendarBuilder()
      .prodId('-//Test//EN')
      .event(event)
      .autoTimezones()
      .build();

    const output = cal.toString();
    expect(output).not.toContain('BEGIN:VTIMEZONE');
  });

  it('collects TZID from DTEND, RDATE, EXDATE too', () => {
    const event = new EventBuilder()
      .uid('e1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 }, { tzid: 'Europe/Rome' })
      .end({ year: 2026, month: 4, day: 13, hour: 10, minute: 0 }, { tzid: 'Europe/Rome' })
      .exdate({ year: 2026, month: 5, day: 1, hour: 9, minute: 0 }, { tzid: 'Europe/Rome' })
      .build();

    const cal = new CalendarBuilder()
      .prodId('-//Test//EN')
      .event(event)
      .autoTimezones()
      .build();

    const output = cal.toString();
    // Should only have one VTIMEZONE even though TZID appears multiple times
    const matches = output.match(/BEGIN:VTIMEZONE/g);
    expect(matches).toHaveLength(1);
  });

  it('works with todos', () => {
    const todo = new TodoBuilder()
      .uid('t1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .due({ year: 2026, month: 4, day: 20, hour: 17, minute: 0 }, { tzid: 'Asia/Tokyo' })
      .build();

    const cal = new CalendarBuilder()
      .prodId('-//Test//EN')
      .todo(todo)
      .autoTimezones()
      .build();

    expect(cal.toString()).toContain('TZID:Asia/Tokyo');
  });
});
