/**
 * Simple event — the most basic use case.
 * Creates a single event with a start/end time.
 *
 * Run: npx tsx examples/01-simple-event.ts
 */
import { writeFileSync } from 'node:fs';
import { CalendarBuilder, EventBuilder } from '../src/index.js';

const event = new EventBuilder()
  .summary('Lunch with Alice')
  .start({ year: 2026, month: 5, day: 10, hour: 12, minute: 30 })
  .end({ year: 2026, month: 5, day: 10, hour: 13, minute: 30 })
  .location('The Italian Place')
  .description('Catch up over lunch')
  .build();

const cal = new CalendarBuilder()
  .prodId('-//ical-ts//Simple Event Example//EN')
  .event(event)
  .build();

writeFileSync('examples/01-simple-event.ics', cal.toString());
console.log('Created examples/01-simple-event.ics');
