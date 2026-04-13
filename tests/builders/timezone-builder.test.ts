import { TimezoneBuilder, TimezoneRuleBuilder } from '../../src/builders/timezone-builder.js';
import { RRuleBuilder } from '../../src/recurrence/rrule-builder.js';

describe('TimezoneBuilder', () => {
  it('builds a timezone with standard and daylight rules', () => {
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

    const output = tz.toString();
    expect(output).toContain('BEGIN:VTIMEZONE');
    expect(output).toContain('TZID:Europe/Rome');
    expect(output).toContain('BEGIN:STANDARD');
    expect(output).toContain('TZOFFSETFROM:+0200');
    expect(output).toContain('TZOFFSETTO:+0100');
    expect(output).toContain('TZNAME:CET');
    expect(output).toContain('END:STANDARD');
    expect(output).toContain('BEGIN:DAYLIGHT');
    expect(output).toContain('TZNAME:CEST');
    expect(output).toContain('END:DAYLIGHT');
    expect(output).toContain('END:VTIMEZONE');
  });

  it('throws if TZID is missing', () => {
    const standard = new TimezoneRuleBuilder('STANDARD')
      .start({ year: 1970, month: 1, day: 1, hour: 0, minute: 0 })
      .offsetFrom('+0000')
      .offsetTo('+0100')
      .build();

    expect(() =>
      new TimezoneBuilder().standard(standard).build()
    ).toThrow('VTIMEZONE requires a TZID property');
  });

  it('throws if no rules are provided', () => {
    expect(() =>
      new TimezoneBuilder().tzId('UTC').build()
    ).toThrow('at least one STANDARD or DAYLIGHT');
  });

  it('throws if timezone rule is missing required properties', () => {
    expect(() =>
      new TimezoneRuleBuilder('STANDARD')
        .start({ year: 1970, month: 1, day: 1, hour: 0, minute: 0 })
        .offsetFrom('+0000')
        .build()
    ).toThrow('STANDARD requires a TZOFFSETTO property');
  });
});
