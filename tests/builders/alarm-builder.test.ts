import { AlarmBuilder } from '../../src/builders/alarm-builder.js';
import { Duration } from '../../src/duration/duration.js';

describe('AlarmBuilder', () => {
  it('builds a display alarm with duration trigger', () => {
    const alarm = new AlarmBuilder()
      .display()
      .trigger(Duration.minutes(15).negate())
      .description('Reminder')
      .build();

    const output = alarm.toString();
    expect(output).toContain('BEGIN:VALARM');
    expect(output).toContain('ACTION:DISPLAY');
    expect(output).toContain('TRIGGER:-PT15M');
    expect(output).toContain('DESCRIPTION:Reminder');
    expect(output).toContain('END:VALARM');
  });

  it('builds an audio alarm', () => {
    const alarm = new AlarmBuilder()
      .audio()
      .trigger(Duration.minutes(5).negate())
      .build();

    const output = alarm.toString();
    expect(output).toContain('ACTION:AUDIO');
  });

  it('builds an email alarm', () => {
    const alarm = new AlarmBuilder()
      .email()
      .trigger(Duration.hours(1).negate())
      .summary('Meeting Reminder')
      .description('Your meeting starts in 1 hour')
      .attendee('dev@example.com')
      .build();

    const output = alarm.toString();
    expect(output).toContain('ACTION:EMAIL');
    expect(output).toContain('SUMMARY:Meeting Reminder');
    expect(output).toContain('ATTENDEE:mailto:dev@example.com');
  });

  it('builds alarm with absolute trigger', () => {
    const alarm = new AlarmBuilder()
      .display()
      .trigger(new Date('2026-04-13T08:45:00Z'))
      .description('Reminder')
      .build();

    const output = alarm.toString();
    expect(output).toContain('TRIGGER;VALUE=DATE-TIME:20260413T084500Z');
  });

  it('builds alarm with RELATED=END', () => {
    const alarm = new AlarmBuilder()
      .display()
      .trigger(Duration.minutes(5), { related: 'END' })
      .description('Follow-up')
      .build();

    const output = alarm.toString();
    expect(output).toContain('TRIGGER;RELATED=END:PT5M');
  });

  it('builds alarm with repeat and duration', () => {
    const alarm = new AlarmBuilder()
      .display()
      .trigger(Duration.minutes(15).negate())
      .description('Reminder')
      .repeat(3)
      .duration(Duration.minutes(5))
      .build();

    const output = alarm.toString();
    expect(output).toContain('REPEAT:3');
    expect(output).toContain('DURATION:PT5M');
  });

  it('throws if ACTION is missing', () => {
    expect(() =>
      new AlarmBuilder()
        .trigger(Duration.minutes(15).negate())
        .description('Test')
        .build()
    ).toThrow('VALARM requires a ACTION property');
  });

  it('throws if TRIGGER is missing', () => {
    expect(() =>
      new AlarmBuilder()
        .display()
        .description('Test')
        .build()
    ).toThrow('VALARM requires a TRIGGER property');
  });

  it('throws if DISPLAY alarm has no DESCRIPTION', () => {
    expect(() =>
      new AlarmBuilder()
        .display()
        .trigger(Duration.minutes(15).negate())
        .build()
    ).toThrow('VALARM requires a DESCRIPTION property');
  });

  it('throws if EMAIL alarm has no SUMMARY', () => {
    expect(() =>
      new AlarmBuilder()
        .email()
        .trigger(Duration.minutes(15).negate())
        .description('Test')
        .attendee('a@b.com')
        .build()
    ).toThrow('VALARM requires a SUMMARY property');
  });

  it('throws if EMAIL alarm has no ATTENDEE', () => {
    expect(() =>
      new AlarmBuilder()
        .email()
        .trigger(Duration.minutes(15).negate())
        .summary('Test')
        .description('Test')
        .build()
    ).toThrow('VALARM requires a ATTENDEE property');
  });

  it('returns an immutable object', () => {
    const alarm = new AlarmBuilder()
      .display()
      .trigger(Duration.minutes(15).negate())
      .description('Test')
      .build();

    expect(Object.isFrozen(alarm)).toBe(true);
  });
});
