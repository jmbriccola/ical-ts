import { EventBuilder } from '../../src/builders/event-builder.js';
import { TodoBuilder } from '../../src/builders/todo-builder.js';
import { JournalBuilder } from '../../src/builders/journal-builder.js';
import { FreeBusyBuilder } from '../../src/builders/freebusy-builder.js';
import { CalendarBuilder } from '../../src/builders/calendar-builder.js';
import { AlarmBuilder } from '../../src/builders/alarm-builder.js';
import { Duration } from '../../src/duration/duration.js';

// Helper: build a minimal event and return its output
function minimalEvent(configure: (b: EventBuilder) => void): string {
  const b = new EventBuilder()
    .uid('test')
    .dtstamp(new Date('2026-04-13T00:00:00Z'))
    .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 });
  configure(b);
  return b.build().toString();
}

describe('ATTACH property', () => {
  it('adds URI attachment on event', () => {
    const output = minimalEvent((b) =>
      b.attach('https://example.com/doc.pdf', { fmttype: 'application/pdf' }),
    );
    expect(output).toContain('ATTACH;FMTTYPE=application/pdf:https://example.com/doc.pdf');
  });

  it('adds binary attachment with ENCODING', () => {
    const output = minimalEvent((b) =>
      b.attach('SGVsbG8gV29ybGQ=', {
        encoding: 'BASE64',
        value: 'BINARY',
        fmttype: 'text/plain',
      }),
    );
    expect(output).toContain('ATTACH;FMTTYPE=text/plain;ENCODING=BASE64;VALUE=BINARY:SGVsbG8gV29ybGQ=');
  });

  it('adds multiple attachments', () => {
    const output = minimalEvent((b) =>
      b
        .attach('https://example.com/a.pdf')
        .attach('https://example.com/b.pdf'),
    );
    expect(output).toContain('ATTACH:https://example.com/a.pdf');
    expect(output).toContain('ATTACH:https://example.com/b.pdf');
  });

  it('adds attachment on todo', () => {
    const todo = new TodoBuilder()
      .uid('t1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .summary('Task')
      .attach('https://example.com/spec.pdf', { fmttype: 'application/pdf' })
      .build();
    expect(todo.toString()).toContain('ATTACH;FMTTYPE=application/pdf:https://example.com/spec.pdf');
  });

  it('adds attachment on journal', () => {
    const journal = new JournalBuilder()
      .uid('j1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .summary('Notes')
      .attach('https://example.com/notes.txt')
      .build();
    expect(journal.toString()).toContain('ATTACH:https://example.com/notes.txt');
  });

  it('adds attachment with FMTTYPE on alarm', () => {
    const alarm = new AlarmBuilder()
      .audio()
      .trigger(Duration.minutes(5).negate())
      .attach('https://example.com/sound.wav', { fmttype: 'audio/wav' })
      .build();
    expect(alarm.toString()).toContain('ATTACH;FMTTYPE=audio/wav:https://example.com/sound.wav');
  });
});

describe('CONTACT property', () => {
  it('adds contact on event', () => {
    const output = minimalEvent((b) => b.contact('John Doe, +1-555-1234'));
    expect(output).toContain('CONTACT:John Doe\\, +1-555-1234');
  });

  it('adds contact with ALTREP', () => {
    const output = minimalEvent((b) =>
      b.contact('Support Team', { altrep: 'https://example.com/contact' }),
    );
    expect(output).toContain('CONTACT;ALTREP="https://example.com/contact":Support Team');
  });

  it('adds multiple contacts', () => {
    const output = minimalEvent((b) =>
      b.contact('Alice').contact('Bob'),
    );
    expect(output).toContain('CONTACT:Alice');
    expect(output).toContain('CONTACT:Bob');
  });

  it('adds contact on todo', () => {
    const todo = new TodoBuilder()
      .uid('t1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .summary('Task')
      .contact('PM Team')
      .build();
    expect(todo.toString()).toContain('CONTACT:PM Team');
  });

  it('adds contact on journal', () => {
    const journal = new JournalBuilder()
      .uid('j1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .contact('Author')
      .build();
    expect(journal.toString()).toContain('CONTACT:Author');
  });

  it('adds contact on freebusy', () => {
    const fb = new FreeBusyBuilder()
      .uid('fb1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .contact('Scheduling System')
      .build();
    expect(fb.toString()).toContain('CONTACT:Scheduling System');
  });
});

describe('RELATED-TO property', () => {
  it('adds simple relation', () => {
    const output = minimalEvent((b) => b.relatedTo('parent-uid-123'));
    expect(output).toContain('RELATED-TO:parent-uid-123');
  });

  it('adds relation with RELTYPE=CHILD', () => {
    const output = minimalEvent((b) =>
      b.relatedTo('child-uid-456', { reltype: 'CHILD' }),
    );
    expect(output).toContain('RELATED-TO;RELTYPE=CHILD:child-uid-456');
  });

  it('adds relation with RELTYPE=SIBLING', () => {
    const output = minimalEvent((b) =>
      b.relatedTo('sibling-uid', { reltype: 'SIBLING' }),
    );
    expect(output).toContain('RELATED-TO;RELTYPE=SIBLING:sibling-uid');
  });

  it('adds multiple relations', () => {
    const output = minimalEvent((b) =>
      b
        .relatedTo('parent-uid', { reltype: 'PARENT' })
        .relatedTo('sibling-uid', { reltype: 'SIBLING' }),
    );
    expect(output).toContain('RELATED-TO;RELTYPE=PARENT:parent-uid');
    expect(output).toContain('RELATED-TO;RELTYPE=SIBLING:sibling-uid');
  });

  it('works on todo', () => {
    const todo = new TodoBuilder()
      .uid('t1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .relatedTo('parent-todo', { reltype: 'PARENT' })
      .build();
    expect(todo.toString()).toContain('RELATED-TO;RELTYPE=PARENT:parent-todo');
  });

  it('works on journal', () => {
    const journal = new JournalBuilder()
      .uid('j1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .relatedTo('event-uid', { reltype: 'PARENT' })
      .build();
    expect(journal.toString()).toContain('RELATED-TO;RELTYPE=PARENT:event-uid');
  });
});

describe('REQUEST-STATUS property', () => {
  it('adds request status on event', () => {
    const output = minimalEvent((b) => b.requestStatus('2.0;Success'));
    expect(output).toContain('REQUEST-STATUS:2.0;Success');
  });

  it('adds request status with extra data', () => {
    const output = minimalEvent((b) =>
      b.requestStatus('3.1;Invalid property value;DTSTART:20260413'),
    );
    expect(output).toContain('REQUEST-STATUS:3.1;Invalid property value;DTSTART:20260413');
  });

  it('works on freebusy', () => {
    const fb = new FreeBusyBuilder()
      .uid('fb1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .requestStatus('2.0;Success')
      .build();
    expect(fb.toString()).toContain('REQUEST-STATUS:2.0;Success');
  });
});

describe('RESOURCES property', () => {
  it('adds resources on event', () => {
    const output = minimalEvent((b) => b.resources('PROJECTOR', 'WHITEBOARD'));
    expect(output).toContain('RESOURCES:PROJECTOR,WHITEBOARD');
  });

  it('adds multiple resource calls', () => {
    const output = minimalEvent((b) =>
      b.resources('PROJECTOR').resources('LAPTOP'),
    );
    expect(output).toContain('RESOURCES:PROJECTOR');
    expect(output).toContain('RESOURCES:LAPTOP');
  });

  it('works on todo', () => {
    const todo = new TodoBuilder()
      .uid('t1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .resources('LAPTOP', 'PRINTER')
      .build();
    expect(todo.toString()).toContain('RESOURCES:LAPTOP,PRINTER');
  });
});

describe('Text property parameters (ALTREP, LANGUAGE)', () => {
  it('adds ALTREP on summary', () => {
    const output = minimalEvent((b) =>
      b.summary('Meeting', { altrep: 'https://example.com/details' }),
    );
    expect(output).toContain('SUMMARY;ALTREP="https://example.com/details":Meeting');
  });

  it('adds LANGUAGE on description', () => {
    const output = minimalEvent((b) =>
      b.description('Riunione di team', { language: 'it' }),
    );
    expect(output).toContain('DESCRIPTION;LANGUAGE=it:Riunione di team');
  });

  it('adds both ALTREP and LANGUAGE', () => {
    const output = minimalEvent((b) =>
      b.location('Sala Conferenze', {
        altrep: 'https://example.com/room',
        language: 'it',
      }),
    );
    expect(output).toContain('LOCATION;ALTREP="https://example.com/room";LANGUAGE=it:Sala Conferenze');
  });

  it('adds LANGUAGE on comment', () => {
    const output = minimalEvent((b) =>
      b.comment('Ottimo lavoro!', { language: 'it' }),
    );
    expect(output).toContain('COMMENT;LANGUAGE=it:Ottimo lavoro!');
  });
});

describe('ATTENDEE MEMBER parameter', () => {
  it('adds MEMBER parameter', () => {
    const output = minimalEvent((b) =>
      b.attendee('dev@example.com', {
        cn: 'Developer',
        member: 'devteam@example.com',
      }),
    );
    expect(output).toContain('MEMBER="mailto:devteam@example.com"');
  });
});

describe('RECURRENCE-ID RANGE parameter', () => {
  it('adds RANGE=THISANDFUTURE', () => {
    const output = minimalEvent((b) =>
      b.recurrenceId(
        { year: 2026, month: 4, day: 15, hour: 9, minute: 0 },
        { tzid: 'Europe/Rome', range: 'THISANDFUTURE' },
      ),
    );
    expect(output).toContain('RECURRENCE-ID;TZID=Europe/Rome;RANGE=THISANDFUTURE:20260415T090000');
  });
});

describe('RFC 7986 Calendar Properties', () => {
  function buildCal(configure: (b: CalendarBuilder) => void): string {
    const event = new EventBuilder()
      .uid('e1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
      .build();
    const b = new CalendarBuilder().prodId('-//Test//EN').event(event);
    configure(b);
    return b.build().toString();
  }

  it('adds NAME property', () => {
    const output = buildCal((b) => b.name('My Calendar'));
    expect(output).toContain('NAME:My Calendar');
  });

  it('adds NAME with LANGUAGE', () => {
    const output = buildCal((b) => b.name('Il Mio Calendario', { language: 'it' }));
    expect(output).toContain('NAME;LANGUAGE=it:Il Mio Calendario');
  });

  it('adds DESCRIPTION', () => {
    const output = buildCal((b) => b.description('Work calendar'));
    expect(output).toContain('DESCRIPTION:Work calendar');
  });

  it('adds UID', () => {
    const output = buildCal((b) => b.uid('cal-uid-123'));
    expect(output).toContain('UID:cal-uid-123');
  });

  it('adds URL', () => {
    const output = buildCal((b) => b.url('https://example.com/cal'));
    expect(output).toContain('URL:https://example.com/cal');
  });

  it('adds COLOR', () => {
    const output = buildCal((b) => b.color('steelblue'));
    expect(output).toContain('COLOR:steelblue');
  });

  it('adds SOURCE', () => {
    const output = buildCal((b) => b.source('https://example.com/cal.ics'));
    expect(output).toContain('SOURCE;VALUE=URI:https://example.com/cal.ics');
  });

  it('adds REFRESH-INTERVAL', () => {
    const output = buildCal((b) => b.refreshInterval(Duration.hours(1)));
    expect(output).toContain('REFRESH-INTERVAL;VALUE=DURATION:PT1H');
  });

  it('adds LAST-MODIFIED', () => {
    const output = buildCal((b) => b.lastModified(new Date('2026-04-13T12:00:00Z')));
    expect(output).toContain('LAST-MODIFIED:20260413T120000Z');
  });

  it('adds CATEGORIES', () => {
    const output = buildCal((b) => b.categories('WORK', 'MEETINGS'));
    expect(output).toContain('CATEGORIES:WORK,MEETINGS');
  });

  it('adds IMAGE', () => {
    const output = buildCal((b) =>
      b.image('https://example.com/logo.png', { fmttype: 'image/png', display: 'BADGE' }),
    );
    // Unfold before checking (line exceeds 75 octets)
    const unfolded = output.replace(/\r\n /g, '');
    expect(unfolded).toContain('IMAGE;VALUE=URI;FMTTYPE=image/png;DISPLAY=BADGE:https://example.com/logo.png');
  });
});
