# ical-ts

A TypeScript library for generating RFC 5545 compliant iCalendar (`.ics`) files with a fluent builder API.

- Full [RFC 5545](https://datatracker.ietf.org/doc/html/rfc5545) coverage (VEVENT, VTODO, VJOURNAL, VFREEBUSY, VTIMEZONE, VALARM)
- [RFC 7986](https://datatracker.ietf.org/doc/html/rfc7986) calendar extensions (NAME, COLOR, IMAGE, CONFERENCE, etc.)
- Fluent builder pattern with method chaining
- Excellent TypeScript autocompletion and type hints
- Zero dependencies, universal runtime (Node.js, browser, Deno, Bun)
- Dual ESM + CJS output

## Installation

```bash
npm install ical-ts
```

## Quick Start

```typescript
import {
  CalendarBuilder,
  EventBuilder,
  AlarmBuilder,
  RRuleBuilder,
  Duration,
} from 'ical-ts';

const alarm = new AlarmBuilder()
  .display()
  .trigger(Duration.minutes(15).negate())
  .description('Meeting in 15 minutes')
  .build();

const event = new EventBuilder()
  .summary('Team Standup')
  .description('Daily sync meeting')
  .start(
    { year: 2026, month: 4, day: 13, hour: 9, minute: 0 },
    { tzid: 'Europe/Rome' },
  )
  .duration(Duration.minutes(30))
  .location('Conference Room A')
  .rrule(
    new RRuleBuilder().freq('WEEKLY').byDay('MO', 'WE', 'FR').count(52),
  )
  .organizer('boss@example.com', { cn: 'The Boss' })
  .attendee('dev@example.com', { cn: 'Developer', rsvp: true })
  .alarm(alarm)
  .build();

const ics = new CalendarBuilder()
  .prodId('-//MyApp//ical-ts//EN')
  .event(event)
  .build()
  .toString();

// ics is now a valid .ics file string
```

## Date/Time Input

All builder methods that accept dates use the `DateInput` type, which can be:

```typescript
// Date-only (VALUE=DATE) — for all-day events
{ year: 2026, month: 4, day: 13 }

// Floating local time (no timezone)
{ year: 2026, month: 4, day: 13, hour: 9, minute: 0 }
// with optional seconds:
{ year: 2026, month: 4, day: 13, hour: 9, minute: 0, second: 30 }

// With timezone (via options)
builder.start(
  { year: 2026, month: 4, day: 13, hour: 9, minute: 0 },
  { tzid: 'Europe/Rome' },
)

// Native Date object — converted to UTC
new Date('2026-04-13T07:00:00Z')

// ISO 8601 string — parsed as Date, converted to UTC
'2026-04-13T07:00:00Z'
```

## Components

### VCALENDAR

The top-level container. `VERSION` defaults to `2.0`.

```typescript
const cal = new CalendarBuilder()
  .prodId('-//MyApp//ical-ts//EN')  // required
  .method('PUBLISH')
  .calScale('GREGORIAN')
  // RFC 7986 extensions
  .name('Work Calendar')
  .color('steelblue')
  .source('https://example.com/cal.ics')
  .refreshInterval(Duration.hours(1))
  .image('https://example.com/logo.png', {
    fmttype: 'image/png',
    display: 'BADGE',
  })
  .event(event)
  .todo(todo)
  .timezone(tz)
  .build();
```

### VEVENT

```typescript
const event = new EventBuilder()
  // Identity (auto-generated if omitted)
  .uid('unique-id')
  .dtstamp(new Date())

  // Timing
  .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 }, { tzid: 'Europe/Rome' })
  .end({ year: 2026, month: 4, day: 13, hour: 10, minute: 0 }, { tzid: 'Europe/Rome' })
  // OR use duration (mutually exclusive with .end())
  // .duration(Duration.hours(1))

  // Details
  .summary('Team Meeting')
  .description('Weekly sync\nWith agenda attached')
  .location('Room 42', { altrep: 'https://example.com/rooms/42' })
  .url('https://example.com/event/123')
  .geo(45.4642, 9.1900)

  // Classification
  .status('CONFIRMED')        // 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED'
  .classification('PUBLIC')   // 'PUBLIC' | 'PRIVATE' | 'CONFIDENTIAL'
  .transparency('OPAQUE')     // 'OPAQUE' | 'TRANSPARENT'
  .priority(5)                // 0-9
  .sequence(0)

  // Categorization
  .categories('MEETING', 'WORK')
  .resources('PROJECTOR', 'WHITEBOARD')

  // People
  .organizer('boss@example.com', { cn: 'The Boss', language: 'en' })
  .attendee('dev@example.com', {
    cn: 'Developer',
    role: 'REQ-PARTICIPANT',
    partstat: 'ACCEPTED',
    rsvp: true,
    cutype: 'INDIVIDUAL',
    member: 'devteam@example.com',
  })

  // Attachments
  .attach('https://example.com/agenda.pdf', { fmttype: 'application/pdf' })

  // Conference (RFC 7986)
  .conference('https://zoom.us/j/123456', {
    label: 'Zoom Meeting',
    feature: ['VIDEO', 'AUDIO'],
  })

  // Relationships
  .relatedTo('parent-uid', { reltype: 'PARENT' })
  .contact('Support Team, +1-555-1234')

  // Recurrence
  .rrule(new RRuleBuilder().freq('WEEKLY').byDay('MO', 'WE', 'FR'))
  .exdate({ year: 2026, month: 4, day: 15, hour: 9, minute: 0 }, { tzid: 'Europe/Rome' })

  // Alarms
  .alarm(alarm)

  // Custom properties
  .xProp('X-CUSTOM-FIELD', 'value')

  .build();
```

### VTODO

```typescript
const todo = new TodoBuilder()
  .summary('Complete project report')
  .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 })
  .due({ year: 2026, month: 4, day: 20, hour: 17, minute: 0 })
  // OR use duration (mutually exclusive with .due())
  // .duration(Duration.days(7))
  .status('IN-PROCESS')          // 'NEEDS-ACTION' | 'COMPLETED' | 'IN-PROCESS' | 'CANCELLED'
  .priority(1)
  .percentComplete(50)
  .completed(new Date('2026-04-18T15:00:00Z'))  // must be DATE-TIME (not date-only)
  .resources('LAPTOP')
  .build();
```

### VJOURNAL

```typescript
const journal = new JournalBuilder()
  .start({ year: 2026, month: 4, day: 13 })
  .summary('Sprint Retrospective')
  .description('Went well: deployment pipeline improvements')
  .description('To improve: test coverage')  // multiple descriptions allowed
  .status('FINAL')  // 'DRAFT' | 'FINAL' | 'CANCELLED'
  .categories('MEETING', 'RETRO')
  .build();
```

### VFREEBUSY

```typescript
const fb = new FreeBusyBuilder()
  .start(new Date('2026-04-13T00:00:00Z'))
  .end(new Date('2026-04-14T00:00:00Z'))
  .freeBusy('20260413T090000Z/20260413T100000Z', 'BUSY')
  .freeBusy('20260413T120000Z/PT1H', 'BUSY-TENTATIVE')
  .contact('Scheduling System')
  .build();
```

### VTIMEZONE

```typescript
const standard = new TimezoneRuleBuilder('STANDARD')
  .start({ year: 1970, month: 10, day: 25, hour: 3, minute: 0 })
  .offsetFrom('+0200')
  .offsetTo('+0100')
  .tzName('CET')
  .rrule(new RRuleBuilder().freq('YEARLY').byMonth(10).byDay('-1SU'))
  .build();

const daylight = new TimezoneRuleBuilder('DAYLIGHT')
  .start({ year: 1970, month: 3, day: 29, hour: 2, minute: 0 })
  .offsetFrom('+0100')
  .offsetTo('+0200')
  .tzName('CEST')
  .rrule(new RRuleBuilder().freq('YEARLY').byMonth(3).byDay('-1SU'))
  .build();

const tz = new TimezoneBuilder()
  .tzId('Europe/Rome')
  .standard(standard)
  .daylight(daylight)
  .build();
```

### VALARM

```typescript
// Display alarm — 15 minutes before
new AlarmBuilder()
  .display()
  .trigger(Duration.minutes(15).negate())
  .description('Meeting starting soon')
  .build()

// Audio alarm with sound file
new AlarmBuilder()
  .audio()
  .trigger(Duration.minutes(5).negate())
  .attach('https://example.com/bell.wav', { fmttype: 'audio/wav' })
  .build()

// Email alarm with repeat
new AlarmBuilder()
  .email()
  .trigger(Duration.hours(1).negate())
  .summary('Reminder: Meeting')
  .description('Your meeting starts in 1 hour')
  .attendee('user@example.com')
  .repeat(2)
  .duration(Duration.minutes(5))
  .build()

// Absolute trigger (specific date/time)
new AlarmBuilder()
  .display()
  .trigger(new Date('2026-04-13T08:45:00Z'))
  .description('Reminder')
  .build()

// Trigger relative to event end
new AlarmBuilder()
  .display()
  .trigger(Duration.minutes(5), { related: 'END' })
  .description('Follow-up')
  .build()
```

## Duration

Immutable value object for RFC 5545 durations. Each method returns a new instance.

```typescript
Duration.hours(1).withMinutes(30).toString()  // 'PT1H30M'
Duration.days(2).toString()                    // 'P2D'
Duration.weeks(1).toString()                   // 'P1W'
Duration.minutes(15).negate().toString()       // '-PT15M'
Duration.days(1).withHours(6).toString()       // 'P1DT6H'
```

## Recurrence Rules

```typescript
// Every weekday
new RRuleBuilder().freq('DAILY').byDay('MO', 'TU', 'WE', 'TH', 'FR')

// Every 2 weeks on Monday
new RRuleBuilder().freq('WEEKLY').interval(2).byDay('MO')

// Monthly on the 15th, 52 occurrences
new RRuleBuilder().freq('MONTHLY').byMonthDay(15).count(52)

// Yearly on the last Friday of March
new RRuleBuilder().freq('YEARLY').byMonth(3).byDay('-1FR')

// Every day at 9:00 and 17:00 until end of year
new RRuleBuilder()
  .freq('DAILY')
  .byHour(9, 17)
  .byMinute(0)
  .until({ year: 2026, month: 12, day: 31 })

// Last weekday of every month
new RRuleBuilder()
  .freq('MONTHLY')
  .byDay('MO', 'TU', 'WE', 'TH', 'FR')
  .bySetPos(-1)

// You can also pass raw RRULE strings
event.rrule('FREQ=DAILY;COUNT=5')
```

## Text Property Options

Text properties (`summary`, `description`, `location`, `comment`, `contact`) support `ALTREP` and `LANGUAGE` parameters:

```typescript
event
  .summary('Riunione di team', { language: 'it' })
  .description('Agenda completa', {
    altrep: 'https://example.com/agenda.html',
    language: 'it',
  })
  .location('Sala Conferenze', {
    altrep: 'https://example.com/rooms/conf',
  })
```

## Recurrence Date Periods

RDATE supports `VALUE=PERIOD` for specifying time ranges as recurrence dates:

```typescript
event
  .rdatePeriod('20260413T090000Z/20260413T100000Z')  // start/end
  .rdatePeriod('20260414T090000Z/PT1H')              // start/duration
```

## Validation

Builders validate required properties and constraints at `.build()` time:

```typescript
import { ICalValidationError } from 'ical-ts';

try {
  new EventBuilder().build();  // no DTSTART set
} catch (e) {
  if (e instanceof ICalValidationError) {
    console.log(e.message);   // 'VEVENT requires a DTSTART property'
    console.log(e.property);  // 'DTSTART'
  }
}
```

Validations include:
- Required properties (DTSTART on VEVENT, PRODID on VCALENDAR, etc.)
- Mutually exclusive properties (DTEND/DURATION, DUE/DURATION, UNTIL/COUNT)
- Action-dependent VALARM requirements (DISPLAY needs DESCRIPTION, EMAIL needs SUMMARY + ATTENDEE)
- COMPLETED must be DATE-TIME, not date-only

UID and DTSTAMP are auto-generated if not explicitly set.

## Serialization

`.build()` produces an immutable model object. Call `.toString()` to serialize to iCalendar format:

```typescript
const cal = new CalendarBuilder()
  .prodId('-//MyApp//EN')
  .event(event)
  .build();

const icsString = cal.toString();

// Write to file (Node.js)
import { writeFileSync } from 'node:fs';
writeFileSync('calendar.ics', icsString);

// Send as HTTP response
res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
res.send(icsString);
```

The serializer handles:
- CRLF line endings (per RFC 5545)
- Line folding at 75 octets (UTF-8 byte-aware)
- Text escaping (backslash, semicolon, comma, newlines)

## RFC Coverage

### RFC 5545 — Core

| Component | Builder | Properties |
|-----------|---------|------------|
| VCALENDAR | `CalendarBuilder` | VERSION, PRODID, CALSCALE, METHOD |
| VEVENT | `EventBuilder` | All 30+ properties |
| VTODO | `TodoBuilder` | All 30+ properties |
| VJOURNAL | `JournalBuilder` | All 25+ properties |
| VFREEBUSY | `FreeBusyBuilder` | All 12 properties |
| VTIMEZONE | `TimezoneBuilder` | TZID, TZURL, LAST-MODIFIED |
| STANDARD/DAYLIGHT | `TimezoneRuleBuilder` | DTSTART, TZOFFSETFROM/TO, TZNAME, RRULE, RDATE |
| VALARM | `AlarmBuilder` | ACTION, TRIGGER, DESCRIPTION, SUMMARY, ATTENDEE, ATTACH, REPEAT, DURATION |

All 20 property parameters: ALTREP, CN, CUTYPE, DELEGATED-FROM, DELEGATED-TO, DIR, ENCODING, FMTTYPE, FBTYPE, LANGUAGE, MEMBER, PARTSTAT, RANGE, RELATED, RELTYPE, ROLE, RSVP, SENT-BY, TZID, VALUE.

### RFC 7986 — Calendar Extensions

NAME, DESCRIPTION, UID, URL, LAST-MODIFIED, CATEGORIES, REFRESH-INTERVAL, SOURCE, COLOR, IMAGE, CONFERENCE.

## TypeScript Types

All enums are string literal unions for tree-shaking and debuggability:

```typescript
type EventStatus = 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED';
type TodoStatus = 'NEEDS-ACTION' | 'COMPLETED' | 'IN-PROCESS' | 'CANCELLED';
type JournalStatus = 'DRAFT' | 'FINAL' | 'CANCELLED';
type Classification = 'PUBLIC' | 'PRIVATE' | 'CONFIDENTIAL';
type Transparency = 'OPAQUE' | 'TRANSPARENT';
type Frequency = 'SECONDLY' | 'MINUTELY' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
type Weekday = 'SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA';
type AlarmAction = 'AUDIO' | 'DISPLAY' | 'EMAIL';
type FreeBusyType = 'FREE' | 'BUSY' | 'BUSY-UNAVAILABLE' | 'BUSY-TENTATIVE';
type ParticipationStatus = 'NEEDS-ACTION' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE' | 'DELEGATED';
type Role = 'CHAIR' | 'REQ-PARTICIPANT' | 'OPT-PARTICIPANT' | 'NON-PARTICIPANT';
```

## License

[MIT](LICENSE)
