import type { Property, PropertyParameters } from '../types/property.js';
import type { DateInput } from '../types/date-time.js';
import type { ITimezone, ITimezoneRule } from '../models/timezone.js';
import { normalizeDateInput } from '../util/date.js';
import { requireProperty } from '../util/validation.js';
import { createTimezone, createTimezoneRule } from '../models/timezone.js';
import { RRuleBuilder } from '../recurrence/rrule-builder.js';

/**
 * Builder for STANDARD or DAYLIGHT sub-components of VTIMEZONE.
 *
 * @example
 * ```ts
 * new TimezoneRuleBuilder('STANDARD')
 *   .start({ year: 1970, month: 10, day: 25, hour: 3, minute: 0 })
 *   .offsetFrom('+0200')
 *   .offsetTo('+0100')
 *   .tzName('CET')
 *   .build()
 * ```
 */
export class TimezoneRuleBuilder {
  private readonly ruleType: 'STANDARD' | 'DAYLIGHT';
  private readonly props: Property[] = [];

  constructor(type: 'STANDARD' | 'DAYLIGHT') {
    this.ruleType = type;
  }

  /** Set the start date-time of this timezone rule (DTSTART, required). */
  start(d: DateInput): this {
    const normalized = normalizeDateInput(d);
    this.setProp('DTSTART', normalized.value);
    return this;
  }

  /** Set the UTC offset before this rule takes effect (required). Format: `+HHMM` or `-HHMM`. */
  offsetFrom(offset: string): this {
    this.setProp('TZOFFSETFROM', offset);
    return this;
  }

  /** Set the UTC offset after this rule takes effect (required). Format: `+HHMM` or `-HHMM`. */
  offsetTo(offset: string): this {
    this.setProp('TZOFFSETTO', offset);
    return this;
  }

  /** Set the timezone name abbreviation (e.g. `'CET'`, `'CEST'`). */
  tzName(name: string): this {
    this.setProp('TZNAME', name);
    return this;
  }

  /** Add a recurrence rule for when this timezone rule repeats. */
  rrule(rule: RRuleBuilder | string): this {
    const value = typeof rule === 'string' ? rule : rule.build();
    this.setProp('RRULE', value);
    return this;
  }

  /** Add a recurrence date. */
  rdate(d: DateInput): this {
    const normalized = normalizeDateInput(d);
    this.addProp('RDATE', normalized.value);
    return this;
  }

  /** Add a comment. */
  comment(text: string): this {
    this.addProp('COMMENT', text);
    return this;
  }

  /** Add a custom X-property. */
  xProp(name: string, value: string, params?: PropertyParameters): this {
    this.addProp(name, value, params ?? {});
    return this;
  }

  /** Build and validate the timezone rule sub-component. */
  build(): ITimezoneRule {
    requireProperty(this.props, 'DTSTART', this.ruleType);
    requireProperty(this.props, 'TZOFFSETFROM', this.ruleType);
    requireProperty(this.props, 'TZOFFSETTO', this.ruleType);
    return createTimezoneRule(this.ruleType, [...this.props]);
  }

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

/**
 * Fluent builder for VTIMEZONE components.
 *
 * @example
 * ```ts
 * new TimezoneBuilder()
 *   .tzId('Europe/Rome')
 *   .standard(
 *     new TimezoneRuleBuilder('STANDARD')
 *       .start({ year: 1970, month: 10, day: 25, hour: 3, minute: 0 })
 *       .offsetFrom('+0200')
 *       .offsetTo('+0100')
 *       .tzName('CET')
 *       .build()
 *   )
 *   .daylight(
 *     new TimezoneRuleBuilder('DAYLIGHT')
 *       .start({ year: 1970, month: 3, day: 29, hour: 2, minute: 0 })
 *       .offsetFrom('+0100')
 *       .offsetTo('+0200')
 *       .tzName('CEST')
 *       .build()
 *   )
 *   .build()
 * ```
 */
export class TimezoneBuilder {
  private readonly props: Property[] = [];
  private readonly rules: ITimezoneRule[] = [];

  /** Set the timezone identifier (TZID, required). E.g. `'Europe/Rome'`. */
  tzId(id: string): this {
    this.setProp('TZID', id);
    return this;
  }

  /** Set a URL for the timezone definition. */
  tzUrl(url: string): this {
    this.setProp('TZURL', url);
    return this;
  }

  /** Set the last modified date. */
  lastModified(d: DateInput): this {
    const normalized = normalizeDateInput(d);
    this.setProp('LAST-MODIFIED', normalized.value);
    return this;
  }

  /** Add a STANDARD rule sub-component. */
  standard(rule: ITimezoneRule): this {
    this.rules.push(rule);
    return this;
  }

  /** Add a DAYLIGHT rule sub-component. */
  daylight(rule: ITimezoneRule): this {
    this.rules.push(rule);
    return this;
  }

  /** Add a custom X-property. */
  xProp(name: string, value: string, params?: PropertyParameters): this {
    this.props.push({ name, value, parameters: params ?? {} });
    return this;
  }

  /** Build and validate the VTIMEZONE component. */
  build(): ITimezone {
    requireProperty(this.props, 'TZID', 'VTIMEZONE');
    if (this.rules.length === 0) {
      throw new Error('VTIMEZONE requires at least one STANDARD or DAYLIGHT sub-component');
    }
    return createTimezone([...this.props], [...this.rules]);
  }

  private setProp(name: string, value: string, params: Record<string, string> = {}): void {
    const idx = this.props.findIndex((p) => p.name === name);
    const prop: Property = { name, value, parameters: params };
    if (idx >= 0) {
      this.props[idx] = prop;
    } else {
      this.props.push(prop);
    }
  }
}
