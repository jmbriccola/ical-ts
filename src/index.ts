// Builders
export {
  CalendarBuilder,
  EventBuilder,
  TodoBuilder,
  JournalBuilder,
  FreeBusyBuilder,
  TimezoneBuilder,
  TimezoneRuleBuilder,
  AlarmBuilder,
} from './builders/index.js';

// Value objects
export { Duration } from './duration/index.js';
export { RRuleBuilder } from './recurrence/index.js';
export type { ByDayValue } from './recurrence/index.js';

// Model interfaces
export type {
  ICalendar,
  IEvent,
  ITodo,
  IJournal,
  IFreeBusy,
  ITimezone,
  ITimezoneRule,
  IAlarm,
} from './models/index.js';

// Types
export type {
  DateOnly,
  DateTime,
  DateInput,
  DateTimePropertyOptions,
  Property,
  PropertyParameters,
  EventStatus,
  TodoStatus,
  JournalStatus,
  Classification,
  Transparency,
  CalScale,
  Method,
  AlarmAction,
  Frequency,
  Weekday,
  FreeBusyType,
  ParticipationStatus,
  Role,
  CalendarUserType,
  TriggerRelationship,
  RelationshipType,
  RecurrenceRange,
} from './types/index.js';

// Option interfaces
export type {
  TextPropertyOptions,
  OrganizerOptions,
  AttendeeOptions,
  RelatedToOptions,
  AttachOptions,
  RecurrenceIdOptions,
  ConferenceFeature,
  ConferenceOptions,
} from './types/index.js';

// Utilities (selectively exposed)
export { ICalValidationError } from './util/validation.js';
