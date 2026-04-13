/**
 * Full calendar — combines all component types: events, todos, journals,
 * and free/busy info. Uses RFC 7986 calendar properties and autoTimezones().
 *
 * Run: npx tsx examples/07-full-calendar.ts
 */
import { writeFileSync } from 'node:fs';
import {
  CalendarBuilder,
  EventBuilder,
  TodoBuilder,
  JournalBuilder,
  FreeBusyBuilder,
  AlarmBuilder,
  RRuleBuilder,
  Duration,
} from '../src/index.js';

// ── Events ──
const planning = new EventBuilder()
  .summary('Sprint Planning')
  .start(
    { year: 2026, month: 5, day: 4, hour: 10, minute: 0 },
    { tzid: 'America/New_York' },
  )
  .duration(Duration.hours(2))
  .organizer('pm@example.com', { cn: 'Project Manager' })
  .attendee('dev@example.com', { cn: 'Developer', rsvp: true })
  .attendee('design@example.com', { cn: 'Designer', rsvp: true })
  .conference('https://zoom.us/j/999', { label: 'Zoom', feature: ['VIDEO', 'AUDIO'] })
  .rrule(new RRuleBuilder().freq('WEEKLY').interval(2).byDay('MO').count(12))
  .alarm(
    new AlarmBuilder()
      .display()
      .trigger(Duration.minutes(15).negate())
      .description('Sprint planning in 15 min')
      .build(),
  )
  .build();

const demo = new EventBuilder()
  .summary('Sprint Demo')
  .start(
    { year: 2026, month: 5, day: 15, hour: 15, minute: 0 },
    { tzid: 'America/New_York' },
  )
  .duration(Duration.hours(1))
  .status('CONFIRMED')
  .categories('MEETING', 'DEMO')
  .attach('https://wiki.example.com/sprint-42-demo', { fmttype: 'text/html' })
  .build();

// ── Todos ──
const bugfix = new TodoBuilder()
  .summary('Fix login timeout issue')
  .description('Users report being logged out after 5 minutes instead of 30')
  .due(
    { year: 2026, month: 5, day: 6, hour: 17, minute: 0 },
    { tzid: 'America/New_York' },
  )
  .priority(2)
  .status('IN-PROCESS')
  .percentComplete(40)
  .categories('BUG', 'AUTH')
  .relatedTo('sprint-42', { reltype: 'PARENT' })
  .build();

// ── Journal ──
const retro = new JournalBuilder()
  .summary('Sprint 41 Retrospective')
  .start({ year: 2026, month: 5, day: 1 })
  .description('What went well: improved deploy pipeline, zero downtime release')
  .description('What to improve: test coverage on auth module, API docs')
  .description('Action items: set up coverage gates, schedule doc sprint')
  .status('FINAL')
  .categories('RETRO', 'AGILE')
  .organizer('pm@example.com', { cn: 'Project Manager' })
  .build();

// ── Free/Busy ──
const availability = new FreeBusyBuilder()
  .start(new Date('2026-05-04T00:00:00Z'))
  .end(new Date('2026-05-08T00:00:00Z'))
  .organizer('dev@example.com', { cn: 'Developer' })
  .freeBusy('20260504T140000Z/20260504T160000Z', 'BUSY')
  .freeBusy('20260505T130000Z/PT2H', 'BUSY')
  .freeBusy('20260506T180000Z/20260506T190000Z', 'BUSY-TENTATIVE')
  .build();

// ── Calendar with RFC 7986 properties + autoTimezones ──
const cal = new CalendarBuilder()
  .prodId('-//ical-ts//Full Calendar Example//EN')
  .name('Engineering Team')
  .description('Sprint events, tasks, and notes')
  .color('steelblue')
  .source('https://example.com/engineering.ics')
  .refreshInterval(Duration.hours(4))
  .method('PUBLISH')
  .event(planning)
  .event(demo)
  .todo(bugfix)
  .journal(retro)
  .freeBusy(availability)
  .autoTimezones()  // auto-adds VTIMEZONE for America/New_York
  .build();

writeFileSync('examples/07-full-calendar.ics', cal.toString());
console.log('Created examples/07-full-calendar.ics');
console.log(`Size: ${cal.toString().length} bytes`);
