/**
 * Todo list — multiple tasks with priorities, due dates, and alarms.
 *
 * Run: npx tsx examples/04-todo-list.ts
 */
import { writeFileSync } from 'node:fs';
import {
  CalendarBuilder,
  TodoBuilder,
  AlarmBuilder,
  Duration,
} from '../src/index.js';

const urgent = new TodoBuilder()
  .summary('Fix production bug #1234')
  .description('Users cannot log in after password reset')
  .start(new Date('2026-04-20T09:00:00Z'))
  .due(new Date('2026-04-20T18:00:00Z'))
  .priority(1)
  .status('IN-PROCESS')
  .percentComplete(60)
  .categories('BUG', 'CRITICAL')
  .contact('oncall@example.com')
  .relatedTo('sprint-42-uid', { reltype: 'PARENT' })
  .alarm(
    new AlarmBuilder()
      .display()
      .trigger(Duration.hours(2).negate())
      .description('Deadline in 2 hours!')
      .build(),
  )
  .build();

const review = new TodoBuilder()
  .summary('Review Q2 roadmap')
  .due({ year: 2026, month: 4, day: 25, hour: 17, minute: 0 })
  .priority(5)
  .status('NEEDS-ACTION')
  .categories('PLANNING')
  .attach('https://docs.example.com/roadmap-q2.pdf', {
    fmttype: 'application/pdf',
  })
  .build();

const completed = new TodoBuilder()
  .summary('Set up CI pipeline')
  .status('COMPLETED')
  .completed(new Date('2026-04-18T15:30:00Z'))
  .percentComplete(100)
  .categories('DEVOPS')
  .build();

const cal = new CalendarBuilder()
  .prodId('-//ical-ts//Todo Example//EN')
  .todo(urgent)
  .todo(review)
  .todo(completed)
  .build();

writeFileSync('examples/04-todo-list.ics', cal.toString());
console.log('Created examples/04-todo-list.ics');
