import type { Property } from '../types/property.js';
import { serializeComponent } from '../util/serialize.js';

/** Immutable representation of a STANDARD or DAYLIGHT sub-component. */
export interface ITimezoneRule {
  readonly type: 'STANDARD' | 'DAYLIGHT';
  readonly properties: ReadonlyArray<Readonly<Property>>;
  toString(): string;
}

/** Immutable representation of a VTIMEZONE component. */
export interface ITimezone {
  readonly type: 'VTIMEZONE';
  readonly properties: ReadonlyArray<Readonly<Property>>;
  readonly rules: ReadonlyArray<ITimezoneRule>;
  toString(): string;
}

/** @internal */
export function createTimezoneRule(
  type: 'STANDARD' | 'DAYLIGHT',
  properties: Property[],
): ITimezoneRule {
  const frozen: ITimezoneRule = {
    type,
    properties: Object.freeze([...properties]),
    toString() {
      return serializeComponent(this.type, this.properties);
    },
  };
  return Object.freeze(frozen);
}

/** @internal */
export function createTimezone(
  properties: Property[],
  rules: ITimezoneRule[],
): ITimezone {
  const frozen: ITimezone = {
    type: 'VTIMEZONE',
    properties: Object.freeze([...properties]),
    rules: Object.freeze([...rules]),
    toString() {
      const children = this.rules.map((r) => r.toString());
      return serializeComponent('VTIMEZONE', this.properties, children);
    },
  };
  return Object.freeze(frozen);
}
