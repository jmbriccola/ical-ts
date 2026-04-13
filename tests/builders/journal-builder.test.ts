import { JournalBuilder } from '../../src/builders/journal-builder.js';

describe('JournalBuilder', () => {
  it('builds a journal entry', () => {
    const journal = new JournalBuilder()
      .uid('journal-1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start({ year: 2026, month: 4, day: 13 })
      .summary('Sprint Retrospective')
      .description('Went well: deployment pipeline improvements')
      .status('FINAL')
      .categories('MEETING', 'RETRO')
      .build();

    const output = journal.toString();
    expect(output).toContain('BEGIN:VJOURNAL');
    expect(output).toContain('UID:journal-1');
    expect(output).toContain('DTSTART;VALUE=DATE:20260413');
    expect(output).toContain('SUMMARY:Sprint Retrospective');
    expect(output).toContain('STATUS:FINAL');
    expect(output).toContain('END:VJOURNAL');
  });

  it('auto-generates UID and DTSTAMP', () => {
    const journal = new JournalBuilder().summary('Note').build();
    const output = journal.toString();
    expect(output).toMatch(/UID:.+/);
  });
});
