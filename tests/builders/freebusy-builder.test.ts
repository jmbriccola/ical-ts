import { FreeBusyBuilder } from '../../src/builders/freebusy-builder.js';

describe('FreeBusyBuilder', () => {
  it('builds a free/busy block', () => {
    const fb = new FreeBusyBuilder()
      .uid('fb-1')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .start(new Date('2026-04-13T00:00:00Z'))
      .end(new Date('2026-04-14T00:00:00Z'))
      .freeBusy('20260413T090000Z/20260413T100000Z', 'BUSY')
      .freeBusy('20260413T120000Z/20260413T130000Z', 'BUSY-TENTATIVE')
      .build();

    const output = fb.toString();
    expect(output).toContain('BEGIN:VFREEBUSY');
    expect(output).toContain('FREEBUSY;FBTYPE=BUSY:20260413T090000Z/20260413T100000Z');
    expect(output).toContain('FREEBUSY;FBTYPE=BUSY-TENTATIVE:20260413T120000Z/20260413T130000Z');
    expect(output).toContain('END:VFREEBUSY');
  });

  it('builds free/busy without type (defaults to BUSY)', () => {
    const fb = new FreeBusyBuilder()
      .uid('fb-2')
      .dtstamp(new Date('2026-04-13T00:00:00Z'))
      .freeBusy('20260413T090000Z/20260413T100000Z')
      .build();

    const output = fb.toString();
    expect(output).toContain('FREEBUSY:20260413T090000Z/20260413T100000Z');
  });
});
