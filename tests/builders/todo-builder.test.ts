import { TodoBuilder } from '../../src/builders/todo-builder.js';
import { Duration } from '../../src/duration/duration.js';

describe('TodoBuilder', () => {
  it('builds a minimal todo', () => {
    const todo = new TodoBuilder()
      .uid('todo-1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .summary('Complete report')
      .build();

    const output = todo.toString();
    expect(output).toContain('BEGIN:VTODO');
    expect(output).toContain('UID:todo-1');
    expect(output).toContain('SUMMARY:Complete report');
    expect(output).toContain('END:VTODO');
  });

  it('builds todo with due date', () => {
    const todo = new TodoBuilder()
      .uid('todo-2')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
      .due({ year: 2026, month: 4, day: 20, hour: 17, minute: 0 })
      .priority(1)
      .status('IN-PROCESS')
      .percentComplete(50)
      .build();

    const output = todo.toString();
    expect(output).toContain('DUE:20260420T170000');
    expect(output).toContain('PRIORITY:1');
    expect(output).toContain('STATUS:IN-PROCESS');
    expect(output).toContain('PERCENT-COMPLETE:50');
  });

  it('throws if both due and duration are set', () => {
    expect(() =>
      new TodoBuilder()
        .uid('conflict')
        .due({ year: 2026, month: 4, day: 20 })
        .duration(Duration.days(7))
        .build()
    ).toThrow('DUE and DURATION are mutually exclusive');
  });

  it('auto-generates UID and DTSTAMP', () => {
    const todo = new TodoBuilder().summary('Task').build();
    const output = todo.toString();
    expect(output).toMatch(/UID:.+/);
    expect(output).toMatch(/DTSTAMP:\d{8}T\d{6}Z/);
  });

  it('builds todo with completed date', () => {
    const todo = new TodoBuilder()
      .uid('done')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .summary('Done task')
      .status('COMPLETED')
      .completed(new Date('2026-04-15T10:00:00Z'))
      .build();

    const output = todo.toString();
    expect(output).toContain('COMPLETED:20260415T100000Z');
    expect(output).toContain('STATUS:COMPLETED');
  });
});
