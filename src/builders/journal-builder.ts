import type { Property, PropertyParameters } from '../types/property.js';
import type { JournalStatus, Classification } from '../types/enums.js';
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
import type { IJournal } from '../models/journal.js';
import { RRuleBuilder } from '../recurrence/rrule-builder.js';
import { normalizeDateInput } from '../util/date.js';
import { generateUid } from '../util/uid.js';
import { createJournal } from '../models/journal.js';
import { buildOrganizerParams, buildAttendeeParams, buildTextParams } from './param-helpers.js';

/**
 * Fluent builder for VJOURNAL components.
 *
 * @example
 * ```ts
 * new JournalBuilder()
 *   .summary('Sprint Retrospective Notes')
 *   .description('Went well: deployment pipeline...')
 *   .start({ year: 2026, month: 4, day: 13 })
 *   .status('FINAL')
 *   .build()
 * ```
 */
export class JournalBuilder {
  private readonly props: Property[] = [];

  uid(uid: string): this {
    this.setProp('UID', uid);
    return this;
  }

  dtstamp(d?: DateInput): this {
    const normalized = normalizeDateInput(d ?? new Date());
    this.setProp('DTSTAMP', normalized.value);
    return this;
  }

  start(d: DateInput, opts?: DateTimePropertyOptions): this {
    const normalized = normalizeDateInput(d);
    const params: Record<string, string> = {};
    if (normalized.isDateOnly) params['VALUE'] = 'DATE';
    else if (opts?.tzid) params['TZID'] = opts.tzid;
    this.setProp('DTSTART', normalized.value, params);
    return this;
  }

  summary(text: string, opts?: TextPropertyOptions): this {
    this.setProp('SUMMARY', text, buildTextParams(opts));
    return this;
  }

  /** Add a description. VJOURNAL allows multiple descriptions. */
  description(text: string, opts?: TextPropertyOptions): this {
    this.addProp('DESCRIPTION', text, buildTextParams(opts));
    return this;
  }

  status(s: JournalStatus): this {
    this.setProp('STATUS', s);
    return this;
  }

  classification(c: Classification): this {
    this.setProp('CLASS', c);
    return this;
  }

  categories(...cats: string[]): this {
    this.addProp('CATEGORIES', cats.join(','));
    return this;
  }

  sequence(n: number): this {
    this.setProp('SEQUENCE', String(n));
    return this;
  }

  created(d: DateInput): this {
    const normalized = normalizeDateInput(d);
    this.setProp('CREATED', normalized.value);
    return this;
  }

  lastModified(d: DateInput): this {
    const normalized = normalizeDateInput(d);
    this.setProp('LAST-MODIFIED', normalized.value);
    return this;
  }

  url(url: string): this {
    this.setProp('URL', url);
    return this;
  }

  comment(text: string, opts?: TextPropertyOptions): this {
    this.addProp('COMMENT', text, buildTextParams(opts));
    return this;
  }

  /** Add contact information. Can be called multiple times. */
  contact(text: string, opts?: TextPropertyOptions): this {
    this.addProp('CONTACT', text, buildTextParams(opts));
    return this;
  }

  /** Add a relationship to another component. */
  relatedTo(uid: string, opts?: RelatedToOptions): this {
    const params: Record<string, string> = {};
    if (opts?.reltype) params['RELTYPE'] = opts.reltype;
    this.addProp('RELATED-TO', uid, params);
    return this;
  }

  /** Add an attachment. Can be called multiple times. */
  attach(uriOrData: string, opts?: AttachOptions): this {
    const params: Record<string, string> = {};
    if (opts?.fmttype) params['FMTTYPE'] = opts.fmttype;
    if (opts?.encoding) params['ENCODING'] = opts.encoding;
    if (opts?.value) params['VALUE'] = opts.value;
    this.addProp('ATTACH', uriOrData, params);
    return this;
  }

  /** Add a conference/meeting URI (RFC 7986). */
  conference(uri: string, opts?: ConferenceOptions): this {
    const params: Record<string, string | string[]> = { VALUE: 'URI' };
    if (opts?.label) params['LABEL'] = opts.label;
    if (opts?.feature) {
      params['FEATURE'] = Array.isArray(opts.feature) ? opts.feature : [opts.feature];
    }
    this.addProp('CONFERENCE', uri, params);
    return this;
  }

  /** Add a request status. */
  requestStatus(value: string): this {
    this.addProp('REQUEST-STATUS', value);
    return this;
  }

  // ──── Recurrence ────

  rrule(rule: RRuleBuilder | string): this {
    const value = typeof rule === 'string' ? rule : rule.build();
    this.setProp('RRULE', value);
    return this;
  }

  rdate(d: DateInput, opts?: DateTimePropertyOptions): this {
    const normalized = normalizeDateInput(d);
    const params: Record<string, string> = {};
    if (normalized.isDateOnly) params['VALUE'] = 'DATE';
    else if (opts?.tzid) params['TZID'] = opts.tzid;
    this.addProp('RDATE', normalized.value, params);
    return this;
  }

  /**
   * Add a recurrence date as a PERIOD value. Can be called multiple times.
   * @param period - `start/end` or `start/duration` (e.g. `'20260413T090000Z/PT1H'`).
   */
  rdatePeriod(period: string): this {
    this.addProp('RDATE', period, { VALUE: 'PERIOD' });
    return this;
  }

  exdate(d: DateInput, opts?: DateTimePropertyOptions): this {
    const normalized = normalizeDateInput(d);
    const params: Record<string, string> = {};
    if (normalized.isDateOnly) params['VALUE'] = 'DATE';
    else if (opts?.tzid) params['TZID'] = opts.tzid;
    this.addProp('EXDATE', normalized.value, params);
    return this;
  }

  recurrenceId(d: DateInput, opts?: RecurrenceIdOptions): this {
    const normalized = normalizeDateInput(d);
    const params: Record<string, string> = {};
    if (normalized.isDateOnly) params['VALUE'] = 'DATE';
    else if (opts?.tzid) params['TZID'] = opts.tzid;
    if (opts?.range) params['RANGE'] = opts.range;
    this.setProp('RECURRENCE-ID', normalized.value, params);
    return this;
  }

  // ──── Attendees & Organizer ────

  organizer(email: string, opts?: OrganizerOptions): this {
    this.setProp('ORGANIZER', `mailto:${email}`, buildOrganizerParams(opts));
    return this;
  }

  attendee(email: string, opts?: AttendeeOptions): this {
    this.addProp('ATTENDEE', `mailto:${email}`, buildAttendeeParams(opts));
    return this;
  }

  // ──── Custom ────

  xProp(name: string, value: string, params?: PropertyParameters): this {
    this.addProp(name, value, params ?? {});
    return this;
  }

  // ──── Build ────

  build(): IJournal {
    if (!this.props.some((p) => p.name === 'UID')) {
      this.setProp('UID', generateUid());
    }
    if (!this.props.some((p) => p.name === 'DTSTAMP')) {
      this.dtstamp();
    }
    return createJournal([...this.props]);
  }

  // ──── Internal ────

  private setProp(name: string, value: string, params: Record<string, string> = {}): void {
    const idx = this.props.findIndex((p) => p.name === name);
    const prop: Property = { name, value, parameters: params };
    if (idx >= 0) this.props[idx] = prop;
    else this.props.push(prop);
  }

  private addProp(name: string, value: string, params: PropertyParameters = {}): void {
    this.props.push({ name, value, parameters: params });
  }
}
