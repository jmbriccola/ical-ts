import { RRuleBuilder } from '../../src/recurrence/rrule-builder.js';

describe('RRuleBuilder', () => {
  it('builds a simple weekly rule', () => {
    const rule = new RRuleBuilder().freq('WEEKLY').build();
    expect(rule).toBe('FREQ=WEEKLY');
  });

  it('builds a rule with count', () => {
    const rule = new RRuleBuilder().freq('DAILY').count(10).build();
    expect(rule).toBe('FREQ=DAILY;COUNT=10');
  });

  it('builds a rule with until', () => {
    const rule = new RRuleBuilder()
      .freq('MONTHLY')
      .until({ year: 2026, month: 12, day: 31 })
      .build();
    expect(rule).toBe('FREQ=MONTHLY;UNTIL=20261231');
  });

  it('builds a rule with interval', () => {
    const rule = new RRuleBuilder().freq('WEEKLY').interval(2).build();
    expect(rule).toBe('FREQ=WEEKLY;INTERVAL=2');
  });

  it('builds a complex weekly rule with byDay', () => {
    const rule = new RRuleBuilder()
      .freq('WEEKLY')
      .byDay('MO', 'WE', 'FR')
      .count(52)
      .build();
    expect(rule).toBe('FREQ=WEEKLY;COUNT=52;BYDAY=MO,WE,FR');
  });

  it('supports ordinal byDay values', () => {
    const rule = new RRuleBuilder()
      .freq('MONTHLY')
      .byDay('2TU')
      .build();
    expect(rule).toBe('FREQ=MONTHLY;BYDAY=2TU');
  });

  it('supports negative ordinal byDay', () => {
    const rule = new RRuleBuilder()
      .freq('MONTHLY')
      .byDay('-1FR')
      .build();
    expect(rule).toBe('FREQ=MONTHLY;BYDAY=-1FR');
  });

  it('builds with byMonth', () => {
    const rule = new RRuleBuilder()
      .freq('YEARLY')
      .byMonth(3, 6, 9, 12)
      .build();
    expect(rule).toBe('FREQ=YEARLY;BYMONTH=3,6,9,12');
  });

  it('builds with byMonthDay', () => {
    const rule = new RRuleBuilder()
      .freq('MONTHLY')
      .byMonthDay(1, 15)
      .build();
    expect(rule).toBe('FREQ=MONTHLY;BYMONTHDAY=1,15');
  });

  it('builds with weekStart', () => {
    const rule = new RRuleBuilder()
      .freq('WEEKLY')
      .weekStart('SU')
      .build();
    expect(rule).toBe('FREQ=WEEKLY;WKST=SU');
  });

  it('builds with bySetPos', () => {
    const rule = new RRuleBuilder()
      .freq('MONTHLY')
      .byDay('MO', 'TU', 'WE', 'TH', 'FR')
      .bySetPos(-1)
      .build();
    expect(rule).toBe('FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1');
  });

  it('builds with byHour, byMinute, bySecond', () => {
    const rule = new RRuleBuilder()
      .freq('DAILY')
      .byHour(9, 17)
      .byMinute(0, 30)
      .bySecond(0)
      .build();
    expect(rule).toBe('FREQ=DAILY;BYSECOND=0;BYMINUTE=0,30;BYHOUR=9,17');
  });

  it('throws if freq is not set', () => {
    expect(() => new RRuleBuilder().count(5).build()).toThrow('FREQ is required');
  });

  it('throws if both until and count are set', () => {
    expect(() =>
      new RRuleBuilder()
        .freq('DAILY')
        .until({ year: 2026, month: 12, day: 31 })
        .count(10)
        .build()
    ).toThrow('UNTIL and COUNT are mutually exclusive');
  });

  it('toString is an alias for build', () => {
    const builder = new RRuleBuilder().freq('DAILY').count(5);
    expect(builder.toString()).toBe(builder.build());
  });
});
