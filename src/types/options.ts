import type {
  Role,
  ParticipationStatus,
  CalendarUserType,
  RelationshipType,
  RecurrenceRange,
} from './enums.js';

/** Options for text properties that support ALTREP and LANGUAGE parameters. */
export interface TextPropertyOptions {
  /** Alternate text representation URI (ALTREP parameter). */
  readonly altrep?: string;
  /** Language tag per RFC 5646 (LANGUAGE parameter). */
  readonly language?: string;
}

/** Options for the ORGANIZER property. */
export interface OrganizerOptions {
  /** Common name (CN parameter). */
  readonly cn?: string;
  /** Sent-by address. */
  readonly sentBy?: string;
  /** Directory entry URI. */
  readonly dir?: string;
  /** Language tag (LANGUAGE parameter). */
  readonly language?: string;
}

/** Options for the ATTENDEE property. */
export interface AttendeeOptions {
  /** Common name (CN parameter). */
  readonly cn?: string;
  /** Role of the attendee. */
  readonly role?: Role;
  /** Participation status. */
  readonly partstat?: ParticipationStatus;
  /** Whether an RSVP is requested. */
  readonly rsvp?: boolean;
  /** Calendar user type. */
  readonly cutype?: CalendarUserType;
  /** Delegated-to address. */
  readonly delegatedTo?: string;
  /** Delegated-from address. */
  readonly delegatedFrom?: string;
  /** Sent-by address. */
  readonly sentBy?: string;
  /** Directory entry URI. */
  readonly dir?: string;
  /** Group membership (MEMBER parameter). */
  readonly member?: string;
  /** Language tag (LANGUAGE parameter). */
  readonly language?: string;
}

/** Options for the RELATED-TO property. */
export interface RelatedToOptions {
  /** Relationship type (default: PARENT). */
  readonly reltype?: RelationshipType;
}

/** Options for the ATTACH property. */
export interface AttachOptions {
  /** Media type (FMTTYPE parameter), e.g. `'application/pdf'`. */
  readonly fmttype?: string;
  /** Set to `'BASE64'` when attaching inline binary data (ENCODING parameter). */
  readonly encoding?: 'BASE64';
  /** Value type override — set to `'BINARY'` for inline data. */
  readonly value?: 'BINARY';
}

/** Extended options for RECURRENCE-ID including RANGE parameter. */
export interface RecurrenceIdOptions {
  /** IANA timezone identifier. */
  readonly tzid?: string;
  /** Range of recurrence instances affected. */
  readonly range?: RecurrenceRange;
}

/** Conference feature capabilities (RFC 7986). */
export type ConferenceFeature = 'AUDIO' | 'CHAT' | 'FEED' | 'MODERATOR' | 'PHONE' | 'SCREEN' | 'VIDEO';

/** Options for the CONFERENCE property (RFC 7986). */
export interface ConferenceOptions {
  /** Human-readable label for the conference URI. */
  readonly label?: string;
  /** Conference capabilities. */
  readonly feature?: ConferenceFeature | ConferenceFeature[];
}
