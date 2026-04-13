/**
 * All-day event — using date-only values (no time component).
 * Also shows how to mark an event as transparent (doesn't block the calendar).
 *
 * Run: npx tsx examples/02-all-day-event.ts
 */
import { writeFileSync } from 'node:fs';
import { CalendarBuilder, EventBuilder } from '../src/index.js';

const holiday = new EventBuilder()
  .summary('Company Retreat')
  .start({ year: 2026, month: 6, day: 15 })
  .end({ year: 2026, month: 6, day: 18 })
  .status('CONFIRMED')
  .transparency('TRANSPARENT')
  .categories('COMPANY', 'OFFSITE')
  .description('Annual team retreat at Lake Como')
  .build();

const birthday = new EventBuilder()
  .summary('Marco\'s Birthday')
  .start({ year: 2026, month: 9, day: 22 })
  .end({ year: 2026, month: 9, day: 23 })
  .transparency('TRANSPARENT')
  .rrule('FREQ=YEARLY')
  .build();

const cal = new CalendarBuilder()
  .prodId('-//ical-ts//All-Day Example//EN')
  .event(holiday)
  .event(birthday)
  .build();

writeFileSync('examples/02-all-day-event.ics', cal.toString());
console.log('Created examples/02-all-day-event.ics');
