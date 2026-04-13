import type { Property, PropertyParameters } from '../types/property.js';
import type { FreeBusyType } from '../types/enums.js';
import type { DateInput } from '../types/date-time.js';
import type {
  TextPropertyOptions,
  OrganizerOptions,
  AttendeeOptions,
} from '../types/options.js';
import type { IFreeBusy } from '../models/freebusy.js';
import { normalizeDateInput } from '../util/date.js';
import { generateUid } from '../util/uid.js';
import { createFreeBusy } from '../models/freebusy.js';
import { buildOrganizerParams, buildAttendeeParams, buildTextParams } from './param-helpers.js';

/**
 * Fluent builder for VFREEBUSY components.
 *
 * @example
 * ```ts
 * new FreeBusyBuilder()
 *   .start(new Date('2026-04-13T00:00:00Z'))
 *   .end(new Date('2026-04-14T00:00:00Z'))
 *   .freeBusy('20260413T090000Z/20260413T100000Z', 'BUSY')
 *   .build()
 * ```
 */
export class FreeBusyBuilder {
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

  start(d: DateInput): this {
    const normalized = normalizeDateInput(d);
    this.setProp('DTSTART', normalized.value);
    return this;
  }

  end(d: DateInput): this {
    const normalized = normalizeDateInput(d);
    this.setProp('DTEND', normalized.value);
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

  /** Add contact information (0-1 per RFC 5545). */
  contact(text: string, opts?: TextPropertyOptions): this {
    this.setProp('CONTACT', text, buildTextParams(opts));
    return this;
  }

  /**
   * Add a free/busy time period.
   * @param period - A period string in the format `start/end` or `start/duration`
   *   (e.g. `'20260413T090000Z/20260413T100000Z'` or `'20260413T090000Z/PT1H'`).
   * @param type - The free/busy type. Defaults to `'BUSY'` if omitted.
   */
  freeBusy(period: string, type?: FreeBusyType): this {
    const params: Record<string, string> = {};
    if (type) params['FBTYPE'] = type;
    this.addProp('FREEBUSY', period, params);
    return this;
  }

  /** Add a request status. */
  requestStatus(value: string): this {
    this.addProp('REQUEST-STATUS', value);
    return this;
  }

  organizer(email: string, opts?: OrganizerOptions): this {
    this.setProp('ORGANIZER', `mailto:${email}`, buildOrganizerParams(opts));
    return this;
  }

  attendee(email: string, opts?: AttendeeOptions): this {
    this.addProp('ATTENDEE', `mailto:${email}`, buildAttendeeParams(opts));
    return this;
  }

  xProp(name: string, value: string, params?: PropertyParameters): this {
    this.addProp(name, value, params ?? {});
    return this;
  }

  build(): IFreeBusy {
    if (!this.props.some((p) => p.name === 'UID')) {
      this.setProp('UID', generateUid());
    }
    if (!this.props.some((p) => p.name === 'DTSTAMP')) {
      this.dtstamp();
    }
    return createFreeBusy([...this.props]);
  }

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
