/**
 * Complex recurrence patterns — demonstrates various RRULE capabilities.
 *
 * Run: npx tsx examples/05-complex-recurrence.ts
 */
import { writeFileSync } from 'node:fs';
import {
  CalendarBuilder,
  EventBuilder,
  RRuleBuilder,
  Duration,
} from '../src/index.js';

// Bi-weekly team retrospective, last 2 hours of Friday
const retro = new EventBuilder()
  .summary('Sprint Retrospective')
  .start({ year: 2026, month: 4, day: 24, hour: 16, minute: 0 })
  .duration(Duration.hours(2))
  .rrule(
    new RRuleBuilder()
      .freq('WEEKLY')
      .interval(2)
      .byDay('FR')
      .count(26),
  )
  .categories('MEETING', 'AGILE')
  .build();

// Payroll reminder — last weekday of every month
const payroll = new EventBuilder()
  .summary('Payroll Deadline')
  .start({ year: 2026, month: 1, day: 30, hour: 10, minute: 0 })
  .duration(Duration.hours(1))
  .rrule(
    new RRuleBuilder()
      .freq('MONTHLY')
      .byDay('MO', 'TU', 'WE', 'TH', 'FR')
      .bySetPos(-1),
  )
  .categories('FINANCE')
  .build();

// Quarterly board meeting — second Tuesday of Jan, Apr, Jul, Oct
const board = new EventBuilder()
  .summary('Board Meeting')
  .start({ year: 2026, month: 1, day: 13, hour: 14, minute: 0 })
  .duration(Duration.hours(3))
  .rrule(
    new RRuleBuilder()
      .freq('MONTHLY')
      .byMonth(1, 4, 7, 10)
      .byDay('2TU'),
  )
  .resources('PROJECTOR', 'CONFERENCE-PHONE')
  .classification('CONFIDENTIAL')
  .build();

// Daily standup at 9:00 and 9:30 (two slots)
const doubleSlot = new EventBuilder()
  .summary('Standup Slot')
  .start({ year: 2026, month: 5, day: 1, hour: 9, minute: 0 })
  .duration(Duration.minutes(15))
  .rrule(
    new RRuleBuilder()
      .freq('DAILY')
      .byHour(9)
      .byMinute(0, 30)
      .count(60),
  )
  .build();

const cal = new CalendarBuilder()
  .prodId('-//ical-ts//Complex Recurrence Example//EN')
  .event(retro)
  .event(payroll)
  .event(board)
  .event(doubleSlot)
  .build();

writeFileSync('examples/05-complex-recurrence.ics', cal.toString());
console.log('Created examples/05-complex-recurrence.ics');
