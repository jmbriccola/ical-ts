// ──── Component Status Types ────

/** Status values for VEVENT components */
export type EventStatus = 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED';

/** Status values for VTODO components */
export type TodoStatus = 'NEEDS-ACTION' | 'COMPLETED' | 'IN-PROCESS' | 'CANCELLED';

/** Status values for VJOURNAL components */
export type JournalStatus = 'DRAFT' | 'FINAL' | 'CANCELLED';

// ──── Classification & Transparency ────

/** Access classification for a component */
export type Classification = 'PUBLIC' | 'PRIVATE' | 'CONFIDENTIAL';

/** Time transparency for VEVENT (does it consume time on a calendar?) */
export type Transparency = 'OPAQUE' | 'TRANSPARENT';

// ──── Calendar-level ────

/** Calendar scale (only GREGORIAN is defined by RFC 5545) */
export type CalScale = 'GREGORIAN';

/** iTIP method for calendar exchange */
export type Method =
  | 'PUBLISH'
  | 'REQUEST'
  | 'REPLY'
  | 'ADD'
  | 'CANCEL'
  | 'REFRESH'
  | 'COUNTER'
  | 'DECLINECOUNTER';

// ──── Alarm ────

/** Alarm action type */
export type AlarmAction = 'AUDIO' | 'DISPLAY' | 'EMAIL';

// ──── Recurrence ────

/** Recurrence frequency */
export type Frequency =
  | 'SECONDLY'
  | 'MINUTELY'
  | 'HOURLY'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'YEARLY';

/** Day of week abbreviation */
export type Weekday = 'SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA';

// ──── Free/Busy ────

/** Free/busy time type */
export type FreeBusyType = 'FREE' | 'BUSY' | 'BUSY-UNAVAILABLE' | 'BUSY-TENTATIVE';

// ──── Attendee/Participant ────

/** Participation status for attendees */
export type ParticipationStatus =
  | 'NEEDS-ACTION'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'TENTATIVE'
  | 'DELEGATED';

/** Role of an attendee in a calendar component */
export type Role =
  | 'CHAIR'
  | 'REQ-PARTICIPANT'
  | 'OPT-PARTICIPANT'
  | 'NON-PARTICIPANT';

/** CUTYPE - calendar user type */
export type CalendarUserType =
  | 'INDIVIDUAL'
  | 'GROUP'
  | 'RESOURCE'
  | 'ROOM'
  | 'UNKNOWN';

// ──── Related trigger ────

/** Alarm trigger relationship */
export type TriggerRelationship = 'START' | 'END';

// ──── Relationship types ────

/** Relationship type for RELATED-TO property (RFC 5545 Section 3.2.15) */
export type RelationshipType = 'PARENT' | 'CHILD' | 'SIBLING';

// ──── Recurrence range ────

/** Range parameter for RECURRENCE-ID (RFC 5545 Section 3.2.13) */
export type RecurrenceRange = 'THISANDFUTURE';
