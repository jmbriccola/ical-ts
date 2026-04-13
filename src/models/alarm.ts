import type { Property } from '../types/property.js';
import { serializeComponent } from '../util/serialize.js';

/** Immutable representation of a VALARM component. */
export interface IAlarm {
  readonly type: 'VALARM';
  readonly properties: ReadonlyArray<Readonly<Property>>;
  toString(): string;
}

/** @internal Create an IAlarm from a property array. */
export function createAlarm(properties: Property[]): IAlarm {
  const frozen: IAlarm = {
    type: 'VALARM',
    properties: Object.freeze([...properties]),
    toString() {
      return serializeComponent('VALARM', this.properties);
    },
  };
  return Object.freeze(frozen);
}
