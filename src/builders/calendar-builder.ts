import type { Property, PropertyParameters } from '../types/property.js';
import type { CalScale, Method } from '../types/enums.js';
import type { DateInput } from '../types/date-time.js';
import type { TextPropertyOptions } from '../types/options.js';
import type { ICalendar } from '../models/calendar.js';
import type { IEvent } from '../models/event.js';
import type { ITodo } from '../models/todo.js';
import type { IJournal } from '../models/journal.js';
import type { IFreeBusy } from '../models/freebusy.js';
import type { ITimezone } from '../models/timezone.js';
import { Duration } from '../duration/duration.js';
import { normalizeDateInput } from '../util/date.js';
import { requireProperty } from '../util/validation.js';
import { createCalendar } from '../models/calendar.js';
import { buildTextParams } from './param-helpers.js';
import { Timezone } from '../timezones/timezone-database.js';

/**
 * Fluent builder for VCALENDAR objects — the top-level container.
 *
 * @example
 * ```ts
 * const cal = new CalendarBuilder()
 *   .prodId('-//MyApp//ical-ts//EN')
 *   .event(event)
 *   .build();
 *
 * console.log(cal.toString()); // full .ics file content
 * ```
 */
export class CalendarBuilder {
  private readonly props: Property[] = [];
  private readonly _events: IEvent[] = [];
  private readonly _todos: ITodo[] = [];
  private readonly _journals: IJournal[] = [];
  private readonly _freeBusys: IFreeBusy[] = [];
  private readonly _timezones: ITimezone[] = [];

  constructor() {
    // Set default VERSION
    this.props.push({ name: 'VERSION', value: '2.0', parameters: {} });
  }

  // ──── RFC 5545 Core Calendar Properties ────

  /** Set the product identifier (PRODID, required). */
  prodId(id: string): this {
    this.setProp('PRODID', id);
    return this;
  }

  /** Set the calendar version. Defaults to `'2.0'`. */
  version(v: string): this {
    this.setProp('VERSION', v);
    return this;
  }

  /** Set the calendar scale. Defaults to `'GREGORIAN'` if not set. */
  calScale(s: CalScale): this {
    this.setProp('CALSCALE', s);
    return this;
  }

  /** Set the iTIP method (e.g. `'PUBLISH'`, `'REQUEST'`). */
  method(m: Method): this {
    this.setProp('METHOD', m);
    return this;
  }

  // ──── RFC 7986 Calendar Properties ────

  /** Set the calendar display name (RFC 7986). Can be called multiple times for different languages. */
  name(text: string, opts?: TextPropertyOptions): this {
    this.addProp('NAME', text, buildTextParams(opts));
    return this;
  }

  /** Set the calendar description (RFC 7986). */
  description(text: string, opts?: TextPropertyOptions): this {
    this.setProp('DESCRIPTION', text, buildTextParams(opts));
    return this;
  }

  /** Set the calendar UID (RFC 7986). */
  uid(uid: string): this {
    this.setProp('UID', uid);
    return this;
  }

  /** Set the calendar URL (RFC 7986). */
  url(url: string): this {
    this.setProp('URL', url);
    return this;
  }

  /** Set the last modified date (RFC 7986). */
  lastModified(d: DateInput): this {
    const normalized = normalizeDateInput(d);
    this.setProp('LAST-MODIFIED', normalized.value);
    return this;
  }

  /** Set calendar categories (RFC 7986). Can be called multiple times. */
  categories(...cats: string[]): this {
    this.addProp('CATEGORIES', cats.join(','));
    return this;
  }

  /**
   * Set the suggested refresh interval for clients (RFC 7986).
   * @param d - Duration between refreshes.
   */
  refreshInterval(d: Duration | string): this {
    const value = typeof d === 'string' ? d : d.toString();
    this.setProp('REFRESH-INTERVAL', value, { VALUE: 'DURATION' });
    return this;
  }

  /** Set the URI for retrieving updated calendar data (RFC 7986). */
  source(uri: string): this {
    this.setProp('SOURCE', uri, { VALUE: 'URI' });
    return this;
  }

  /**
   * Set the display color for this calendar (RFC 7986).
   * Uses CSS3 color names (e.g. `'red'`, `'steelblue'`).
   */
  color(color: string): this {
    this.setProp('COLOR', color);
    return this;
  }

  /**
   * Add an image for this calendar (RFC 7986).
   * @param uri - URI of the image.
   * @param opts - Optional: specify FMTTYPE and DISPLAY parameters.
   */
  image(uri: string, opts?: { fmttype?: string; display?: 'BADGE' | 'GRAPHIC' | 'FULLSIZE' | 'THUMBNAIL' }): this {
    const params: Record<string, string> = { VALUE: 'URI' };
    if (opts?.fmttype) params['FMTTYPE'] = opts.fmttype;
    if (opts?.display) params['DISPLAY'] = opts.display;
    this.addProp('IMAGE', uri, params);
    return this;
  }

  // ──── Components ────

  /** Add a VEVENT component. Can be called multiple times. */
  event(e: IEvent): this {
    this._events.push(e);
    return this;
  }

  /** Add a VTODO component. Can be called multiple times. */
  todo(t: ITodo): this {
    this._todos.push(t);
    return this;
  }

  /** Add a VJOURNAL component. Can be called multiple times. */
  journal(j: IJournal): this {
    this._journals.push(j);
    return this;
  }

  /** Add a VFREEBUSY component. Can be called multiple times. */
  freeBusy(fb: IFreeBusy): this {
    this._freeBusys.push(fb);
    return this;
  }

  /** Add a VTIMEZONE component. Can be called multiple times. */
  timezone(tz: ITimezone): this {
    this._timezones.push(tz);
    return this;
  }

  // ──── Auto-timezone ────

  /**
   * Scan all components for TZID parameters and automatically add the
   * corresponding VTIMEZONE definitions from the built-in database.
   *
   * Skips timezone IDs that are already present or not in the database.
   *
   * @example
   * ```ts
   * new CalendarBuilder()
   *   .prodId('-//MyApp//EN')
   *   .event(eventWithTzidEuropeRome)
   *   .autoTimezones()  // adds VTIMEZONE for Europe/Rome
   *   .build();
   * ```
   */
  autoTimezones(): this {
    const existingIds = new Set(
      this._timezones.map((tz) =>
        tz.properties.find((p) => p.name === 'TZID')?.value,
      ),
    );

    const referencedIds = new Set<string>();

    const collectTzids = (properties: ReadonlyArray<{ readonly parameters: { readonly [key: string]: string | string[] | undefined } }>) => {
      for (const prop of properties) {
        const tzid = prop.parameters['TZID'];
        if (typeof tzid === 'string' && tzid) {
          referencedIds.add(tzid);
        }
      }
    };

    for (const event of this._events) {
      collectTzids(event.properties);
    }
    for (const todo of this._todos) {
      collectTzids(todo.properties);
    }
    for (const journal of this._journals) {
      collectTzids(journal.properties);
    }

    for (const id of referencedIds) {
      if (!existingIds.has(id) && Timezone.has(id)) {
        this._timezones.push(Timezone.get(id));
        existingIds.add(id);
      }
    }

    return this;
  }

  // ──── Custom ────

  /** Add a custom X-property or IANA-registered property. */
  xProp(name: string, value: string, params?: PropertyParameters): this {
    this.props.push({ name, value, parameters: params ?? {} });
    return this;
  }

  // ──── Build ────

  /**
   * Build and validate the VCALENDAR.
   * @throws {ICalValidationError} if PRODID is missing
   */
  build(): ICalendar {
    requireProperty(this.props, 'PRODID', 'VCALENDAR');

    return createCalendar(
      [...this.props],
      [...this._events],
      [...this._todos],
      [...this._journals],
      [...this._freeBusys],
      [...this._timezones],
    );
  }

  private setProp(name: string, value: string, params: Record<string, string> = {}): void {
    const idx = this.props.findIndex((p) => p.name === name);
    const prop: Property = { name, value, parameters: params };
    if (idx >= 0) this.props[idx] = prop;
    else this.props.push(prop);
  }

  private addProp(name: string, value: string, params: Record<string, string> = {}): void {
    this.props.push({ name, value, parameters: params });
  }
}
