import { EventBuilder } from '../../src/builders/event-builder.js';
import { TodoBuilder } from '../../src/builders/todo-builder.js';
import { JournalBuilder } from '../../src/builders/journal-builder.js';

function minimalEvent(configure: (b: EventBuilder) => void): string {
  const b = new EventBuilder()
    .uid('test')
    .dtstamp(new Date('2026-04-13T00:00:00Z'))
    .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 });
  configure(b);
  return b.build().toString();
}

describe('RDATE VALUE=PERIOD', () => {
  it('adds RDATE with PERIOD on event', () => {
    const output = minimalEvent((b) =>
      b.rdatePeriod('20260413T090000Z/20260413T100000Z'),
    );
    expect(output).toContain('RDATE;VALUE=PERIOD:20260413T090000Z/20260413T100000Z');
  });

  it('adds RDATE with PERIOD using duration format', () => {
    const output = minimalEvent((b) =>
      b.rdatePeriod('20260413T090000Z/PT1H'),
    );
    expect(output).toContain('RDATE;VALUE=PERIOD:20260413T090000Z/PT1H');
  });

  it('supports multiple PERIOD rdates', () => {
    const output = minimalEvent((b) =>
      b
        .rdatePeriod('20260413T090000Z/PT1H')
        .rdatePeriod('20260414T090000Z/PT1H'),
    );
    expect(output).toContain('RDATE;VALUE=PERIOD:20260413T090000Z/PT1H');
    expect(output).toContain('RDATE;VALUE=PERIOD:20260414T090000Z/PT1H');
  });

  it('works on todo', () => {
    const todo = new TodoBuilder()
      .uid('t1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .rdatePeriod('20260413T090000Z/PT2H')
      .build();
    expect(todo.toString()).toContain('RDATE;VALUE=PERIOD:20260413T090000Z/PT2H');
  });

  it('works on journal', () => {
    const journal = new JournalBuilder()
      .uid('j1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .rdatePeriod('20260413T090000Z/20260413T100000Z')
      .build();
    expect(journal.toString()).toContain('RDATE;VALUE=PERIOD:20260413T090000Z/20260413T100000Z');
  });
});

describe('CONFERENCE property (RFC 7986)', () => {
  it('adds conference with label and features on event', () => {
    const output = minimalEvent((b) =>
      b.conference('https://zoom.us/j/123', {
        label: 'Zoom Meeting',
        feature: ['VIDEO', 'AUDIO'],
      }),
    );
    // Unfold in case of long line
    const unfolded = output.replace(/\r\n /g, '');
    expect(unfolded).toContain('CONFERENCE;VALUE=URI;LABEL=Zoom Meeting;FEATURE=VIDEO,AUDIO:https://zoom.us/j/123');
  });

  it('adds conference with single feature', () => {
    const output = minimalEvent((b) =>
      b.conference('tel:+1-555-1234', { feature: 'PHONE' }),
    );
    const unfolded = output.replace(/\r\n /g, '');
    expect(unfolded).toContain('CONFERENCE;VALUE=URI;FEATURE=PHONE:tel:+1-555-1234');
  });

  it('adds conference without options', () => {
    const output = minimalEvent((b) =>
      b.conference('https://meet.example.com/abc'),
    );
    const unfolded = output.replace(/\r\n /g, '');
    expect(unfolded).toContain('CONFERENCE;VALUE=URI:https://meet.example.com/abc');
  });

  it('supports multiple conferences', () => {
    const output = minimalEvent((b) =>
      b
        .conference('https://zoom.us/j/123', { label: 'Zoom' })
        .conference('tel:+1-555-1234', { label: 'Dial-in', feature: 'PHONE' }),
    );
    const unfolded = output.replace(/\r\n /g, '');
    expect(unfolded).toContain('CONFERENCE;VALUE=URI;LABEL=Zoom:https://zoom.us/j/123');
    expect(unfolded).toContain('CONFERENCE;VALUE=URI;LABEL=Dial-in;FEATURE=PHONE:tel:+1-555-1234');
  });

  it('works on todo', () => {
    const todo = new TodoBuilder()
      .uid('t1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .conference('https://meet.example.com', { label: 'Meet' })
      .build();
    const unfolded = todo.toString().replace(/\r\n /g, '');
    expect(unfolded).toContain('CONFERENCE;VALUE=URI;LABEL=Meet:https://meet.example.com');
  });

  it('works on journal', () => {
    const journal = new JournalBuilder()
      .uid('j1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .conference('https://meet.example.com')
      .build();
    const unfolded = journal.toString().replace(/\r\n /g, '');
    expect(unfolded).toContain('CONFERENCE;VALUE=URI:https://meet.example.com');
  });
});

describe('COMPLETED DATE-TIME enforcement', () => {
  it('accepts Date object', () => {
    const todo = new TodoBuilder()
      .uid('t1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .completed(new Date('2026-04-15T10:00:00Z'))
      .build();
    expect(todo.toString()).toContain('COMPLETED:20260415T100000Z');
  });

  it('accepts ISO string', () => {
    const todo = new TodoBuilder()
      .uid('t1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .completed('2026-04-15T10:00:00Z')
      .build();
    expect(todo.toString()).toContain('COMPLETED:20260415T100000Z');
  });

  it('rejects DateOnly (compile-time enforced via type narrowing)', () => {
    // The type signature now only accepts Date | string, so DateOnly won't compile.
    // This test verifies the runtime guard still works for edge cases.
    const builder = new TodoBuilder()
      .uid('t1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'));

    // @ts-expect-error - DateOnly not assignable to Date | string
    expect(() => builder.completed({ year: 2026, month: 4, day: 15 })).toThrow(
      'COMPLETED must be a DATE-TIME value',
    );
  });
});
