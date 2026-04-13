/**
 * Email alarm — sends email reminders with attachments.
 * Also demonstrates audio alarms and alarm repetition.
 *
 * Run: npx tsx examples/06-email-alarm.ts
 */
import { writeFileSync } from 'node:fs';
import {
  CalendarBuilder,
  EventBuilder,
  AlarmBuilder,
  Duration,
} from '../src/index.js';

const event = new EventBuilder()
  .summary('Product Launch Presentation')
  .start(new Date('2026-06-01T10:00:00Z'))
  .end(new Date('2026-06-01T11:30:00Z'))
  .location('Main Auditorium')
  .status('CONFIRMED')
  .priority(1)

  // Email alarm — 1 day before, with attachment
  .alarm(
    new AlarmBuilder()
      .email()
      .trigger(Duration.days(1).negate())
      .summary('Reminder: Product Launch Tomorrow')
      .description(
        'The product launch presentation is tomorrow at 10:00 UTC.\n' +
        'Please review the attached slides.',
      )
      .attendee('presenter@example.com', { cn: 'Presenter' })
      .attendee('ceo@example.com', { cn: 'CEO' })
      .attach('https://docs.example.com/launch-slides.pptx', {
        fmttype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })
      .build(),
  )

  // Display alarm — 30 minutes before, repeats 3 times every 5 minutes
  .alarm(
    new AlarmBuilder()
      .display()
      .trigger(Duration.minutes(30).negate())
      .description('Presentation in 30 minutes')
      .repeat(3)
      .duration(Duration.minutes(5))
      .build(),
  )

  // Audio alarm — 5 minutes before
  .alarm(
    new AlarmBuilder()
      .audio()
      .trigger(Duration.minutes(5).negate())
      .attach('https://example.com/sounds/alert.wav', { fmttype: 'audio/wav' })
      .build(),
  )

  .build();

const cal = new CalendarBuilder()
  .prodId('-//ical-ts//Email Alarm Example//EN')
  .event(event)
  .build();

writeFileSync('examples/06-email-alarm.ics', cal.toString());
console.log('Created examples/06-email-alarm.ics');
