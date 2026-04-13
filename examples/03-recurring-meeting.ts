/**
 * Recurring meeting — weekly standup with timezone, alarms, attendees,
 * and a conference link. Uses autoTimezones() for automatic VTIMEZONE injection.
 *
 * Run: npx tsx examples/03-recurring-meeting.ts
 */
import { writeFileSync } from 'node:fs';
import {
  CalendarBuilder,
  EventBuilder,
  AlarmBuilder,
  RRuleBuilder,
  Duration,
} from '../src/index.js';

const standup = new EventBuilder()
  .summary('Daily Standup')
  .description('Progress, blockers, plans for the day')
  .start(
    { year: 2026, month: 4, day: 20, hour: 9, minute: 0 },
    { tzid: 'Europe/Rome' },
  )
  .duration(Duration.minutes(15))
  .location('Dev Room')
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
  .event(standup)
  .autoTimezones()  // auto-adds VTIMEZONE for Europe/Rome
  .build();

writeFileSync('examples/03-recurring-meeting.ics', cal.toString());
console.log('Created examples/03-recurring-meeting.ics');
