import type { Property, PropertyParameters } from '../types/property.js';
import type {
  EventStatus,
  Classification,
  Transparency,
  RelationshipType,
} from '../types/enums.js';
import type { DateInput, DateTimePropertyOptions } from '../types/date-time.js';
import type {
  TextPropertyOptions,
  OrganizerOptions,
  AttendeeOptions,
  RelatedToOptions,
  AttachOptions,
  RecurrenceIdOptions,
  ConferenceOptions,
} from '../types/options.js';
import type { IEvent } from '../models/event.js';
import type { IAlarm } from '../models/alarm.js';
import { Duration } from '../duration/duration.js';
import { RRuleBuilder } from '../recurrence/rrule-builder.js';
import { normalizeDateInput } from '../util/date.js';
import { generateUid } from '../util/uid.js';
import { requireProperty, mutuallyExclusive } from '../util/validation.js';
import { createEvent } from '../models/event.js';
import { buildOrganizerParams, buildAttendeeParams, buildTextParams } from './param-helpers.js';

/**
 * Fluent builder for VEVENT components.
 *
 * @example
 * ```ts
 * new EventBuilder()
 *   .summary('Team Standup')
 *   .start({ year: 2026, month: 4, day: 13, hour: 9, minute: 0 }, { tzid: 'Europe/Rome' })
 *   .duration(Duration.minutes(30))
 *   .location('Meeting Room')
 *   .build()
 * ```
 */
export class EventBuilder {
  private readonly props: Property[] = [];
  private readonly _alarms: IAlarm[] = [];

  // ──── Required properties ────

  /** Set the unique identifier. Auto-generated if not called. */
  uid(uid: string): this {
    this.setProp('UID', uid);
    return this;
  }

  /** Set the timestamp (DTSTAMP). Auto-set to now if not called. */
  dtstamp(d?: DateInput): this {
    const normalized = normalizeDateInput(d ?? new Date());
    this.setProp('DTSTAMP', normalized.value);
    return this;
  }

  /**
   * Set the start date/time (DTSTART, required).
   * @param d - The start date.
   * @param opts - Optional: specify a TZID for timezone-aware times.
   */
  start(d: DateInput, opts?: DateTimePropertyOptions): this {
    const normalized = normalizeDateInput(d);
    const params: Record<string, string> = {};
    if (normalized.isDateOnly) {
      params['VALUE'] = 'DATE';
    } else if (opts?.tzid) {
      params['TZID'] = opts.tzid;
    }
    this.setProp('DTSTART', normalized.value, params);
    return this;
  }

  /**
   * Set the end date/time (DTEND). Mutually exclusive with `duration()`.
   * @param d - The end date.
   * @param opts - Optional: specify a TZID for timezone-aware times.
   */
  end(d: DateInput, opts?: DateTimePropertyOptions): this {
    const normalized = normalizeDateInput(d);
    const params: Record<string, string> = {};
    if (normalized.isDateOnly) {
      params['VALUE'] = 'DATE';
    } else if (opts?.tzid) {
      params['TZID'] = opts.tzid;
    }
    this.setProp('DTEND', normalized.value, params);
    return this;
  }

  /** Set the event duration. Mutually exclusive with `end()`. */
  duration(d: Duration | string): this {
    this.setProp('DURATION', typeof d === 'string' ? d : d.toString());
    return this;
  }

  // ──── Standard optional properties ────

  /** Set the event summary/title. */
  summary(text: string, opts?: TextPropertyOptions): this {
    this.setProp('SUMMARY', text, buildTextParams(opts));
    return this;
  }

  /** Set the event description. */
  description(text: string, opts?: TextPropertyOptions): this {
    this.setProp('DESCRIPTION', text, buildTextParams(opts));
    return this;
  }

  /** Set the event location. */
  location(text: string, opts?: TextPropertyOptions): this {
    this.setProp('LOCATION', text, buildTextParams(opts));
    return this;
  }

  /** Set the geographic position (latitude, longitude). */
  geo(lat: number, lon: number): this {
    this.setProp('GEO', `${lat};${lon}`);
    return this;
  }

  /** Set the event URL. */
  url(url: string): this {
    this.setProp('URL', url);
    return this;
  }

  /** Set the event status. */
  status(s: EventStatus): this {
    this.setProp('STATUS', s);
    return this;
  }

  /** Set the access classification. */
  classification(c: Classification): this {
    this.setProp('CLASS', c);
    return this;
  }

  /** Set the time transparency (whether the event consumes time on a calendar). */
  transparency(t: Transparency): this {
    this.setProp('TRANSP', t);
    return this;
  }

  /** Set the priority (0 = undefined, 1 = highest, 9 = lowest). */
  priority(p: number): this {
    this.setProp('PRIORITY', String(p));
    return this;
  }

  /** Set the revision sequence number. */
  sequence(n: number): this {
    this.setProp('SEQUENCE', String(n));
    return this;
  }

  /** Set one or more categories. Can be called multiple times to add more. */
  categories(...cats: string[]): this {
    this.addProp('CATEGORIES', cats.join(','));
    return this;
  }

  /** Set one or more resources. Can be called multiple times to add more. */
  resources(...res: string[]): this {
    this.addProp('RESOURCES', res.join(','));
    return this;
  }

  /** Set the creation date. */
  created(d: DateInput): this {
    const normalized = normalizeDateInput(d);
    this.setProp('CREATED', normalized.value);
    return this;
  }

  /** Set the last modified date. */
  lastModified(d: DateInput): this {
    const normalized = normalizeDateInput(d);
    this.setProp('LAST-MODIFIED', normalized.value);
    return this;
  }

  /** Add a comment. Can be called multiple times. */
  comment(text: string, opts?: TextPropertyOptions): this {
    this.addProp('COMMENT', text, buildTextParams(opts));
    return this;
  }

  /** Add contact information. Can be called multiple times. */
  contact(text: string, opts?: TextPropertyOptions): this {
    this.addProp('CONTACT', text, buildTextParams(opts));
    return this;
  }

  /**
   * Add a relationship to another component. Can be called multiple times.
   * @param uid - The UID of the related component.
   * @param opts - Optional: specify the relationship type (PARENT, CHILD, SIBLING).
   */
  relatedTo(uid: string, opts?: RelatedToOptions): this {
    const params: Record<string, string> = {};
    if (opts?.reltype) params['RELTYPE'] = opts.reltype;
    this.addProp('RELATED-TO', uid, params);
    return this;
  }

  /**
   * Add an attachment. Can be called multiple times.
   * @param uriOrData - A URI string, or base64-encoded binary data.
   * @param opts - Optional: specify FMTTYPE, ENCODING, VALUE parameters.
   */
  attach(uriOrData: string, opts?: AttachOptions): this {
    const params: Record<string, string> = {};
    if (opts?.fmttype) params['FMTTYPE'] = opts.fmttype;
    if (opts?.encoding) params['ENCODING'] = opts.encoding;
    if (opts?.value) params['VALUE'] = opts.value;
    this.addProp('ATTACH', uriOrData, params);
    return this;
  }

  /**
   * Add a conference/meeting URI (RFC 7986).
   * @param uri - The conference URI (e.g. `'https://zoom.us/j/123'`).
   * @param opts - Optional: specify a label and features.
   * @example conference('https://zoom.us/j/123', { label: 'Zoom Meeting', feature: ['VIDEO', 'AUDIO'] })
   */
  conference(uri: string, opts?: ConferenceOptions): this {
    const params: Record<string, string | string[]> = { VALUE: 'URI' };
    if (opts?.label) params['LABEL'] = opts.label;
    if (opts?.feature) {
      params['FEATURE'] = Array.isArray(opts.feature) ? opts.feature : [opts.feature];
    }
    this.addProp('CONFERENCE', uri, params);
    return this;
  }

  /**
   * Add a request status. Can be called multiple times.
   * Format: `statuscode;description[;extradata]`
   * @example requestStatus('2.0;Success')
   * @example requestStatus('3.1;Invalid property value;DTSTART:20260413')
   */
  requestStatus(value: string): this {
    this.addProp('REQUEST-STATUS', value);
    return this;
  }

  /** Set the recurrence ID (for overriding a specific occurrence). */
  recurrenceId(d: DateInput, opts?: RecurrenceIdOptions): this {
    const normalized = normalizeDateInput(d);
    const params: Record<string, string> = {};
    if (normalized.isDateOnly) {
      params['VALUE'] = 'DATE';
    } else if (opts?.tzid) {
      params['TZID'] = opts.tzid;
    }
    if (opts?.range) params['RANGE'] = opts.range;
    this.setProp('RECURRENCE-ID', normalized.value, params);
    return this;
  }

  // ──── Recurrence ────

  /** Set a recurrence rule. Accepts an RRuleBuilder or a raw RRULE string. */
  rrule(rule: RRuleBuilder | string): this {
    const value = typeof rule === 'string' ? rule : rule.build();
    this.setProp('RRULE', value);
    return this;
  }

  /** Add a recurrence date. Can be called multiple times. */
  rdate(d: DateInput, opts?: DateTimePropertyOptions): this {
    const normalized = normalizeDateInput(d);
    const params: Record<string, string> = {};
    if (normalized.isDateOnly) {
      params['VALUE'] = 'DATE';
    } else if (opts?.tzid) {
      params['TZID'] = opts.tzid;
    }
    this.addProp('RDATE', normalized.value, params);
    return this;
  }

  /**
   * Add a recurrence date as a PERIOD value. Can be called multiple times.
   * @param period - A period string: `start/end` or `start/duration`
   *   (e.g. `'20260413T090000Z/20260413T100000Z'` or `'20260413T090000Z/PT1H'`).
   */
  rdatePeriod(period: string): this {
    this.addProp('RDATE', period, { VALUE: 'PERIOD' });
    return this;
  }

  /** Add an exception date (exclude from recurrence). Can be called multiple times. */
  exdate(d: DateInput, opts?: DateTimePropertyOptions): this {
    const normalized = normalizeDateInput(d);
    const params: Record<string, string> = {};
    if (normalized.isDateOnly) {
      params['VALUE'] = 'DATE';
    } else if (opts?.tzid) {
      params['TZID'] = opts.tzid;
    }
    this.addProp('EXDATE', normalized.value, params);
    return this;
  }

  // ──── Attendees & Organizer ────

  /** Set the event organizer. */
  organizer(email: string, opts?: OrganizerOptions): this {
    this.setProp('ORGANIZER', `mailto:${email}`, buildOrganizerParams(opts));
    return this;
  }

  /** Add an attendee. Can be called multiple times. */
  attendee(email: string, opts?: AttendeeOptions): this {
    this.addProp('ATTENDEE', `mailto:${email}`, buildAttendeeParams(opts));
    return this;
  }

  // ──── Sub-components ────

  /** Add a VALARM sub-component. */
  alarm(alarm: IAlarm): this {
    this._alarms.push(alarm);
    return this;
  }

  // ──── Custom properties ────

  /** Add a custom X-property or IANA-registered property. */
  xProp(name: string, value: string, params?: PropertyParameters): this {
    this.addProp(name, value, params ?? {});
    return this;
  }

  // ──── Build ────

  /**
   * Build and validate the VEVENT component.
   *
   * Auto-generates UID and DTSTAMP if not set.
   * @throws {ICalValidationError} if required properties are missing or constraints are violated
   */
  build(): IEvent {
    if (!this.props.some((p) => p.name === 'UID')) {
      this.setProp('UID', generateUid());
    }
    if (!this.props.some((p) => p.name === 'DTSTAMP')) {
      this.dtstamp();
    }

    requireProperty(this.props, 'DTSTART', 'VEVENT');
    mutuallyExclusive(this.props, 'DTEND', 'DURATION', 'VEVENT');

    return createEvent([...this.props], [...this._alarms]);
  }

  // ──── Internal helpers ────

  private setProp(name: string, value: string, params: Record<string, string> = {}): void {
    const idx = this.props.findIndex((p) => p.name === name);
    const prop: Property = { name, value, parameters: params };
    if (idx >= 0) {
      this.props[idx] = prop;
    } else {
      this.props.push(prop);
    }
  }

  private addProp(name: string, value: string, params: PropertyParameters = {}): void {
    this.props.push({ name, value, parameters: params });
  }
}
