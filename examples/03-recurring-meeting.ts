/**
 * Recurring meeting — weekly standup with timezone, alarms, attendees,
 * and a conference link. Demonstrates the most common real-world pattern.
 *
 * Run: npx tsx examples/03-recurring-meeting.ts
 */
import { writeFileSync } from 'node:fs';
import {
  CalendarBuilder,
  EventBuilder,
  AlarmBuilder,
  TimezoneBuilder,
  TimezoneRuleBuilder,
  RRuleBuilder,
  Duration,
} from '../src/index.js';

// ── Europe/Rome timezone definition ──
const tz = new TimezoneBuilder()
  .tzId('Europe/Rome')
  .standard(
    new TimezoneRuleBuilder('STANDARD')
      .start({ year: 1970, month: 10, day: 25, hour: 3, minute: 0 })
      .offsetFrom('+0200')
      .offsetTo('+0100')
      .tzName('CET')
      .rrule(new RRuleBuilder().freq('YEARLY').byMonth(10).byDay('-1SU'))
      .build(),
  )
  .daylight(
    new TimezoneRuleBuilder('DAYLIGHT')
      .start({ year: 1970, month: 3, day: 29, hour: 2, minute: 0 })
      .offsetFrom('+0100')
      .offsetTo('+0200')
      .tzName('CEST')
      .rrule(new RRuleBuilder().freq('YEARLY').byMonth(3).byDay('-1SU'))
      .build(),
  )
  .build();

// ── Recurring standup ──
const standup = new EventBuilder()
  .summary('Daily Standup')
  .description('Progress, blockers, plans for the day')
  .start(
    { year: 2026, month: 4, day: 20, hour: 9, minute: 0 },
    { tzid: 'Europe/Rome' },
  )
  .duration(Duration.minutes(15))
  .location('Sala Dev')
  .status('CONFIRMED')
  .rrule(
    new RRuleBuilder()
      .freq('WEEKLY')
      .byDay('MO', 'TU', 'WE', 'TH', 'FR')
      .until({ year: 2026, month: 12, day: 31, hour: 23, minute: 59 }),
  )
  // Skip a holiday
  .exdate(
    { year: 2026, month: 5, day: 1, hour: 9, minute: 0 },
    { tzid: 'Europe/Rome' },
  )
  // Conference link
  .conference('https://meet.google.com/abc-defg-hij', {
    label: 'Google Meet',
    feature: ['VIDEO', 'AUDIO'],
  })
  // People
  .organizer('tech-lead@example.com', { cn: 'Tech Lead' })
  .attendee('dev1@example.com', { cn: 'Alice', rsvp: true, role: 'REQ-PARTICIPANT' })
  .attendee('dev2@example.com', { cn: 'Bob', rsvp: true, role: 'REQ-PARTICIPANT' })
  .attendee('pm@example.com', { cn: 'Carol', role: 'OPT-PARTICIPANT' })
  // Two alarms
  .alarm(
    new AlarmBuilder()
      .display()
      .trigger(Duration.minutes(10).negate())
      .description('Standup in 10 minutes')
      .build(),
  )
  .alarm(
    new AlarmBuilder()
      .display()
      .trigger(Duration.minutes(1).negate())
      .description('Standup starting now!')
      .build(),
  )
  .build();

const cal = new CalendarBuilder()
  .prodId('-//ical-ts//Recurring Meeting Example//EN')
  .timezone(tz)
  .event(standup)
  .build();

writeFileSync('examples/03-recurring-meeting.ics', cal.toString());
console.log('Created examples/03-recurring-meeting.ics');
