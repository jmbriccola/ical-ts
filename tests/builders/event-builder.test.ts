import { EventBuilder } from '../../src/builders/event-builder.js';
import { AlarmBuilder } from '../../src/builders/alarm-builder.js';
import { RRuleBuilder } from '../../src/recurrence/rrule-builder.js';
import { Duration } from '../../src/duration/duration.js';

describe('EventBuilder', () => {
  it('builds a minimal event', () => {
    const event = new EventBuilder()
      .uid('test-uid-123')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
      .build();

    const output = event.toString();
    expect(output).toContain('BEGIN:VEVENT');
    expect(output).toContain('UID:test-uid-123');
    expect(output).toContain('DTSTAMP:20260413T000000Z');
    expect(output).toContain('DTSTART:20260413T090000');
    expect(output).toContain('END:VEVENT');
  });

  it('auto-generates UID and DTSTAMP', () => {
    const event = new EventBuilder()
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
      .build();

    const output = event.toString();
    expect(output).toMatch(/UID:.+/);
    expect(output).toMatch(/DTSTAMP:\d{8}T\d{6}Z/);
  });

  it('builds event with all common properties', () => {
    const event = new EventBuilder()
      .uid('full-event')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 }, { tzid: 'Europe/Rome' })
      .end({ year: 2026, month: 4, day: 13, hour: 10, minute: 0 }, { tzid: 'Europe/Rome' })
      .summary('Team Meeting')
      .description('Weekly sync')
      .location('Conference Room A')
      .url('https://meet.example.com/abc')
      .status('CONFIRMED')
      .classification('PUBLIC')
      .transparency('OPAQUE')
      .priority(5)
      .sequence(0)
      .categories('MEETING', 'WORK')
      .build();

    const output = event.toString();
    expect(output).toContain('DTSTART;TZID=Europe/Rome:20260413T090000');
    expect(output).toContain('DTEND;TZID=Europe/Rome:20260413T100000');
    expect(output).toContain('SUMMARY:Team Meeting');
    expect(output).toContain('DESCRIPTION:Weekly sync');
    expect(output).toContain('LOCATION:Conference Room A');
    expect(output).toContain('URL:https://meet.example.com/abc');
    expect(output).toContain('STATUS:CONFIRMED');
    expect(output).toContain('CLASS:PUBLIC');
    expect(output).toContain('TRANSP:OPAQUE');
    expect(output).toContain('PRIORITY:5');
    expect(output).toContain('SEQUENCE:0');
    expect(output).toContain('CATEGORIES:MEETING,WORK');
  });

  it('builds event with date-only start (all-day event)', () => {
    const event = new EventBuilder()
      .uid('allday')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13 })
      .end({ year: 2026, month: 4, day: 14 })
      .summary('Holiday')
      .build();

    const output = event.toString();
    expect(output).toContain('DTSTART;VALUE=DATE:20260413');
    expect(output).toContain('DTEND;VALUE=DATE:20260414');
  });

  it('builds event with UTC Date objects', () => {
    const event = new EventBuilder()
      .uid('utc-event')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start(new Date('2026-04-13T09:00:00Z'))
      .end(new Date('2026-04-13T10:00:00Z'))
      .build();

    const output = event.toString();
    expect(output).toContain('DTSTART:20260413T090000Z');
    expect(output).toContain('DTEND:20260413T100000Z');
  });

  it('builds event with duration instead of end', () => {
    const event = new EventBuilder()
      .uid('dur-event')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
      .duration(Duration.hours(1).withMinutes(30))
      .build();

    const output = event.toString();
    expect(output).toContain('DURATION:PT1H30M');
    expect(output).not.toContain('DTEND');
  });

  it('throws if both end and duration are set', () => {
    expect(() =>
      new EventBuilder()
        .uid('conflict')
        .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
        .end({ year: 2026, month: 4, day: 13, hour: 10, minute: 0 })
        .duration(Duration.hours(1))
        .build()
    ).toThrow('DTEND and DURATION are mutually exclusive');
  });

  it('throws if DTSTART is missing', () => {
    expect(() =>
      new EventBuilder()
        .uid('no-start')
        .build()
    ).toThrow('VEVENT requires a DTSTART property');
  });

  it('builds event with recurrence rule', () => {
    const event = new EventBuilder()
      .uid('recurring')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
      .rrule(new RRuleBuilder().freq('WEEKLY').byDay('MO', 'WE', 'FR').count(52))
      .build();

    const output = event.toString();
    expect(output).toContain('RRULE:FREQ=WEEKLY;COUNT=52;BYDAY=MO,WE,FR');
  });

  it('builds event with string rrule', () => {
    const event = new EventBuilder()
      .uid('recurring-str')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
      .rrule('FREQ=DAILY;COUNT=5')
      .build();

    const output = event.toString();
    expect(output).toContain('RRULE:FREQ=DAILY;COUNT=5');
  });

  it('builds event with exdate', () => {
    const event = new EventBuilder()
      .uid('exdate-event')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 }, { tzid: 'Europe/Rome' })
      .rrule(new RRuleBuilder().freq('DAILY').count(10))
      .exdate({ year: 2026, month: 4, day: 15, hour: 9, minute: 0 }, { tzid: 'Europe/Rome' })
      .build();

    const output = event.toString();
    expect(output).toContain('EXDATE;TZID=Europe/Rome:20260415T090000');
  });

  it('builds event with organizer and attendees', () => {
    const event = new EventBuilder()
      .uid('attendee-event')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
      .organizer('boss@example.com', { cn: 'The Boss' })
      .attendee('dev@example.com', { cn: 'Developer', rsvp: true, role: 'REQ-PARTICIPANT' })
      .attendee('pm@example.com', { cn: 'PM', partstat: 'ACCEPTED' })
      .build();

    const output = event.toString();
    expect(output).toContain('ORGANIZER;CN=The Boss:mailto:boss@example.com');
    expect(output).toContain('ATTENDEE;CN=Developer;ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:dev@example.com');
    expect(output).toContain('ATTENDEE;CN=PM;PARTSTAT=ACCEPTED:mailto:pm@example.com');
  });

  it('builds event with alarm sub-component', () => {
    const alarm = new AlarmBuilder()
      .display()
      .trigger(Duration.minutes(15).negate())
      .description('Reminder')
      .build();

    const event = new EventBuilder()
      .uid('alarm-event')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
      .alarm(alarm)
      .build();

    const output = event.toString();
    expect(output).toContain('BEGIN:VALARM');
    expect(output).toContain('ACTION:DISPLAY');
    expect(output).toContain('END:VALARM');
    // VALARM should be nested inside VEVENT
    const veventStart = output.indexOf('BEGIN:VEVENT');
    const veventEnd = output.indexOf('END:VEVENT');
    const valarmStart = output.indexOf('BEGIN:VALARM');
    expect(valarmStart).toBeGreaterThan(veventStart);
    expect(valarmStart).toBeLessThan(veventEnd);
  });

  it('builds event with geo', () => {
    const event = new EventBuilder()
      .uid('geo-event')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
      .geo(45.4642, 9.1900)
      .build();

    const output = event.toString();
    expect(output).toContain('GEO:45.4642;9.19');
  });

  it('builds event with X-properties', () => {
    const event = new EventBuilder()
      .uid('xprop-event')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
      .xProp('X-CUSTOM-FIELD', 'custom-value')
      .build();

    const output = event.toString();
    expect(output).toContain('X-CUSTOM-FIELD:custom-value');
  });

  it('produces immutable model', () => {
    const event = new EventBuilder()
      .uid('frozen')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
      .build();

    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event.properties)).toBe(true);
  });

  it('escapes special characters in text properties', () => {
    const event = new EventBuilder()
      .uid('escape-event')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
      .summary('Meeting; with, Bob')
      .description('Line 1\nLine 2')
      .build();

    const output = event.toString();
    expect(output).toContain('SUMMARY:Meeting\\; with\\, Bob');
    expect(output).toContain('DESCRIPTION:Line 1\\nLine 2');
  });
});
