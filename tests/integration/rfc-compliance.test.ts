import { CalendarBuilder } from '../../src/builders/calendar-builder.js';
import { EventBuilder } from '../../src/builders/event-builder.js';
import { TodoBuilder } from '../../src/builders/todo-builder.js';
import { JournalBuilder } from '../../src/builders/journal-builder.js';
import { AlarmBuilder } from '../../src/builders/alarm-builder.js';
import { TimezoneBuilder, TimezoneRuleBuilder } from '../../src/builders/timezone-builder.js';
import { RRuleBuilder } from '../../src/recurrence/rrule-builder.js';
import { Duration } from '../../src/duration/duration.js';

const encoder = new TextEncoder();

describe('RFC 5545 Compliance', () => {
  function buildFullCalendar(): string {
    const standard = new TimezoneRuleBuilder('STANDARD')
      .start({ year: 1970, month: 10, day: 25, hour: 3, minute: 0 })
      .offsetFrom('+0200')
      .offsetTo('+0100')
      .tzName('CET')
      .rrule(new RRuleBuilder().freq('YEARLY').byMonth(10).byDay('-1SU'))
      .build();

    const daylight = new TimezoneRuleBuilder('DAYLIGHT')
      .start({ year: 1970, month: 3, day: 29, hour: 2, minute: 0 })
      .offsetFrom('+0100')
      .offsetTo('+0200')
      .tzName('CEST')
      .rrule(new RRuleBuilder().freq('YEARLY').byMonth(3).byDay('-1SU'))
      .build();

    const tz = new TimezoneBuilder()
      .tzId('Europe/Rome')
      .standard(standard)
      .daylight(daylight)
      .build();

    const alarm = new AlarmBuilder()
      .display()
      .trigger(Duration.minutes(15).negate())
      .description('Meeting in 15 minutes')
      .build();

    const event = new EventBuilder()
      .uid('rfc-test-event@ical-ts')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 }, { tzid: 'Europe/Rome' })
      .duration(Duration.minutes(30))
      .summary('Team Standup')
      .description('Daily sync meeting\nWith the whole team')
      .location('Sala Riunioni; Piano 2')
      .rrule(new RRuleBuilder().freq('WEEKLY').byDay('MO', 'WE', 'FR').count(52))
      .organizer('boss@example.com', { cn: 'Il Boss' })
      .attendee('dev@example.com', { cn: 'Developer', rsvp: true, role: 'REQ-PARTICIPANT' })
      .status('CONFIRMED')
      .classification('PUBLIC')
      .transparency('OPAQUE')
      .alarm(alarm)
      .build();

    const todo = new TodoBuilder()
      .uid('rfc-test-todo@ical-ts')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .summary('Prepare slides')
      .due({ year: 2026, month: 4, day: 13, hour: 8, minute: 30 }, { tzid: 'Europe/Rome' })
      .status('NEEDS-ACTION')
      .priority(2)
      .build();

    const journal = new JournalBuilder()
      .uid('rfc-test-journal@ical-ts')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13 })
      .summary('Meeting Notes')
      .description('Discussed quarterly goals, action items assigned.')
      .status('FINAL')
      .build();

    const cal = new CalendarBuilder()
      .prodId('-//ical-ts//RFC Compliance Test//EN')
      .method('PUBLISH')
      .calScale('GREGORIAN')
      .timezone(tz)
      .event(event)
      .todo(todo)
      .journal(journal)
      .build();

    return cal.toString();
  }

  let output: string;

  beforeAll(() => {
    output = buildFullCalendar();
  });

  it('starts with BEGIN:VCALENDAR and ends with END:VCALENDAR', () => {
    expect(output.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(output.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });

  it('contains required VERSION and PRODID', () => {
    expect(output).toContain('VERSION:2.0');
    expect(output).toContain('PRODID:-//ical-ts//RFC Compliance Test//EN');
  });

  it('uses only CRLF line endings', () => {
    for (let i = 0; i < output.length; i++) {
      if (output[i] === '\n') {
        expect(output[i - 1]).toBe('\r');
      }
    }
  });

  it('no unfolded line exceeds 75 octets', () => {
    // After unfolding, split by CRLF and check each line's byte length
    const lines = output.split('\r\n');
    for (const line of lines) {
      // Folded continuation lines start with a space — they're part of the previous line
      // We check the raw split which includes fold points
      if (line.startsWith(' ')) continue; // continuation line, skip
      // For non-continuation lines, rebuild the full logical line
    }

    // Better approach: check each physical line in the raw output
    const physicalLines = output.split('\r\n');
    for (const line of physicalLines) {
      if (line === '') continue; // empty line at end
      const lineWithFoldPrefix = line.startsWith(' ') ? line : line;
      const byteLen = encoder.encode(lineWithFoldPrefix).length;
      expect(byteLen).toBeLessThanOrEqual(75);
    }
  });

  it('has correct BEGIN/END nesting', () => {
    const stack: string[] = [];
    const lines = output.split('\r\n');
    for (const line of lines) {
      const unfoldedLine = line.startsWith(' ') ? line.slice(1) : line;
      if (unfoldedLine.startsWith('BEGIN:')) {
        stack.push(unfoldedLine.slice(6));
      } else if (unfoldedLine.startsWith('END:')) {
        const name = unfoldedLine.slice(4);
        const top = stack.pop();
        expect(top).toBe(name);
      }
    }
    expect(stack.length).toBe(0);
  });

  it('contains all expected components', () => {
    expect(output).toContain('BEGIN:VTIMEZONE');
    expect(output).toContain('BEGIN:VEVENT');
    expect(output).toContain('BEGIN:VTODO');
    expect(output).toContain('BEGIN:VJOURNAL');
    expect(output).toContain('BEGIN:VALARM');
    expect(output).toContain('BEGIN:STANDARD');
    expect(output).toContain('BEGIN:DAYLIGHT');
  });

  it('timezones appear before events', () => {
    const tzIdx = output.indexOf('BEGIN:VTIMEZONE');
    const eventIdx = output.indexOf('BEGIN:VEVENT');
    expect(tzIdx).toBeLessThan(eventIdx);
  });

  it('escapes text values correctly', () => {
    // Description has a newline
    expect(output).toContain('Daily sync meeting\\nWith the whole team');
    // Location has a semicolon
    expect(output).toContain('Sala Riunioni\\; Piano 2');
  });

  it('contains recurrence rule', () => {
    expect(output).toContain('RRULE:FREQ=WEEKLY;COUNT=52;BYDAY=MO,WE,FR');
  });

  it('contains alarm with correct trigger', () => {
    expect(output).toContain('TRIGGER:-PT15M');
  });

  it('event has TZID parameter on DTSTART', () => {
    expect(output).toContain('DTSTART;TZID=Europe/Rome:20260413T090000');
  });

  it('todo has DUE with TZID', () => {
    expect(output).toContain('DUE;TZID=Europe/Rome:20260413T083000');
  });

  it('journal has date-only DTSTART', () => {
    expect(output).toContain('DTSTART;VALUE=DATE:20260413');
  });
});
