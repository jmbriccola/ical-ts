import { CalendarBuilder } from '../../src/builders/calendar-builder.js';
import { EventBuilder } from '../../src/builders/event-builder.js';
import { TodoBuilder } from '../../src/builders/todo-builder.js';

describe('CalendarBuilder', () => {
  it('builds a minimal calendar', () => {
    const event = new EventBuilder()
      .uid('event-1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
      .summary('Test')
      .build();

    const cal = new CalendarBuilder()
      .prodId('-//Test//ical-ts//EN')
      .event(event)
      .build();

    const output = cal.toString();
    expect(output).toContain('BEGIN:VCALENDAR');
    expect(output).toContain('VERSION:2.0');
    expect(output).toContain('PRODID:-//Test//ical-ts//EN');
    expect(output).toContain('BEGIN:VEVENT');
    expect(output).toContain('END:VEVENT');
    expect(output).toContain('END:VCALENDAR');
  });

  it('defaults VERSION to 2.0', () => {
    const event = new EventBuilder()
      .uid('e1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
      .build();

    const cal = new CalendarBuilder().prodId('-//Test//EN').event(event).build();
    const output = cal.toString();
    expect(output).toContain('VERSION:2.0');
  });

  it('sets method and calscale', () => {
    const event = new EventBuilder()
      .uid('e1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
      .build();

    const cal = new CalendarBuilder()
      .prodId('-//Test//EN')
      .method('PUBLISH')
      .calScale('GREGORIAN')
      .event(event)
      .build();

    const output = cal.toString();
    expect(output).toContain('METHOD:PUBLISH');
    expect(output).toContain('CALSCALE:GREGORIAN');
  });

  it('throws if PRODID is missing', () => {
    expect(() => new CalendarBuilder().build()).toThrow(
      'VCALENDAR requires a PRODID property'
    );
  });

  it('builds calendar with multiple component types', () => {
    const event = new EventBuilder()
      .uid('e1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
      .build();

    const todo = new TodoBuilder()
      .uid('t1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .summary('Task')
      .build();

    const cal = new CalendarBuilder()
      .prodId('-//Test//EN')
      .event(event)
      .todo(todo)
      .build();

    const output = cal.toString();
    expect(output).toContain('BEGIN:VEVENT');
    expect(output).toContain('BEGIN:VTODO');
  });

  it('uses CRLF line endings throughout', () => {
    const event = new EventBuilder()
      .uid('e1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
      .build();

    const cal = new CalendarBuilder()
      .prodId('-//Test//EN')
      .event(event)
      .build();

    const output = cal.toString();
    // All line breaks should be CRLF
    const linesWithLF = output.split('\n').filter((_, i, arr) => {
      if (i === 0) return false;
      return !arr[i - 1]?.endsWith('\r') && arr[i - 1] !== undefined;
    });
    // The split creates items; check that no bare \n exists
    expect(output.includes('\n')).toBe(true); // has newlines
    // Every \n should be preceded by \r
    for (let i = 0; i < output.length; i++) {
      if (output[i] === '\n' && i > 0) {
        expect(output[i - 1]).toBe('\r');
      }
    }
  });

  it('produces immutable model', () => {
    const event = new EventBuilder()
      .uid('e1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
      .build();

    const cal = new CalendarBuilder()
      .prodId('-//Test//EN')
      .event(event)
      .build();

    expect(Object.isFrozen(cal)).toBe(true);
  });
});
