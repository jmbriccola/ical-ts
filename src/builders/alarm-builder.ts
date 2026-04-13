import type { Property, PropertyParameters } from '../types/property.js';
import type { AlarmAction, TriggerRelationship } from '../types/enums.js';
import type { DateInput } from '../types/date-time.js';
import type { AttachOptions } from '../types/options.js';
import type { IAlarm } from '../models/alarm.js';
import { Duration } from '../duration/duration.js';
import { normalizeDateInput } from '../util/date.js';
import { requireProperty } from '../util/validation.js';
import { createAlarm } from '../models/alarm.js';

/**
 * Fluent builder for VALARM components.
 *
 * @example
 * ```ts
 * // Display alarm 15 minutes before event
 * new AlarmBuilder()
 *   .display()
 *   .trigger(Duration.minutes(15).negate())
 *   .description('Meeting in 15 minutes')
 *   .build()
 *
 * // Email alarm at a specific date-time
 * new AlarmBuilder()
 *   .email()
 *   .trigger(new Date('2026-04-13T08:45:00Z'))
 *   .summary('Reminder')
 *   .description('Your meeting starts soon')
 *   .attendee('dev@example.com')
 *   .build()
 * ```
 */
export class AlarmBuilder {
  private readonly props: Property[] = [];

  // ──── ACTION shortcuts ────

  /** Set alarm action to DISPLAY. Requires DESCRIPTION. */
  display(): this {
    return this.action('DISPLAY');
  }

  /** Set alarm action to AUDIO. */
  audio(): this {
    return this.action('AUDIO');
  }

  /** Set alarm action to EMAIL. Requires DESCRIPTION, SUMMARY, and at least one ATTENDEE. */
  email(): this {
    return this.action('EMAIL');
  }

  /** Set the alarm action type. */
  action(action: AlarmAction): this {
    this.setProp('ACTION', action);
    return this;
  }

  // ──── TRIGGER ────

  /**
   * Set the alarm trigger.
   *
   * @param value - A `Duration` for relative triggers, a `Date`/`DateInput` for absolute triggers.
   * @param opts - Optional: set `related` to `'END'` for duration triggers relative to the end.
   */
  trigger(
    value: Duration | DateInput,
    opts?: { related?: TriggerRelationship },
  ): this {
    if (value instanceof Duration) {
      const params: Record<string, string> = {};
      if (opts?.related) {
        params['RELATED'] = opts.related;
      }
      this.addProp('TRIGGER', value.toString(), params);
    } else {
      const normalized = normalizeDateInput(value);
      this.addProp('TRIGGER', normalized.value, { VALUE: 'DATE-TIME' });
    }
    return this;
  }

  // ──── Properties ────

  /** Set the alarm description (required for DISPLAY and EMAIL). */
  description(text: string): this {
    this.setProp('DESCRIPTION', text);
    return this;
  }

  /** Set the alarm summary (required for EMAIL). */
  summary(text: string): this {
    this.setProp('SUMMARY', text);
    return this;
  }

  /** Add an attendee email (required for EMAIL, can be called multiple times). */
  attendee(email: string, opts?: { cn?: string }): this {
    const params: Record<string, string> = {};
    if (opts?.cn) params['CN'] = opts.cn;
    this.addProp('ATTENDEE', `mailto:${email}`, params);
    return this;
  }

  /** Set the repeat count for the alarm. Must be used with `duration()`. */
  repeat(count: number): this {
    this.setProp('REPEAT', String(count));
    return this;
  }

  /** Set the duration between alarm repetitions. Must be used with `repeat()`. */
  duration(d: Duration | string): this {
    this.setProp('DURATION', typeof d === 'string' ? d : d.toString());
    return this;
  }

  /**
   * Add an attachment. For AUDIO alarms, this is the sound file.
   * For EMAIL alarms, these are email attachments (can be called multiple times).
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

  /** Add a custom X-property. */
  xProp(name: string, value: string, params?: PropertyParameters): this {
    this.addProp(name, value, params ?? {});
    return this;
  }

  /**
   * Build and validate the VALARM component.
   * @throws {ICalValidationError} if required properties are missing
   */
  build(): IAlarm {
    requireProperty(this.props, 'ACTION', 'VALARM');
    requireProperty(this.props, 'TRIGGER', 'VALARM');

    const action = this.props.find((p) => p.name === 'ACTION')?.value;
    if (action === 'DISPLAY' || action === 'EMAIL') {
      requireProperty(this.props, 'DESCRIPTION', 'VALARM');
    }
    if (action === 'EMAIL') {
      requireProperty(this.props, 'SUMMARY', 'VALARM');
      requireProperty(this.props, 'ATTENDEE', 'VALARM');
    }

    return createAlarm([...this.props]);
  }

  // ──── Internal helpers ────

  /** Set a single-value property (replaces if already set). */
  private setProp(name: string, value: string, params: Record<string, string> = {}): void {
    const idx = this.props.findIndex((p) => p.name === name);
    const prop: Property = { name, value, parameters: params };
    if (idx >= 0) {
      this.props[idx] = prop;
    } else {
      this.props.push(prop);
    }
  }

  /** Add a property (allows duplicates, e.g. ATTENDEE). */
  private addProp(name: string, value: string, params: PropertyParameters = {}): void {
    this.props.push({ name, value, parameters: params });
  }
}
