import type { Property } from '../types/property.js';
import type { IAlarm } from './alarm.js';
import { serializeComponent } from '../util/serialize.js';

/** Immutable representation of a VEVENT component. */
export interface IEvent {
  readonly type: 'VEVENT';
  readonly properties: ReadonlyArray<Readonly<Property>>;
  readonly alarms: ReadonlyArray<IAlarm>;
  toString(): string;
}

/** @internal */
export function createEvent(properties: Property[], alarms: IAlarm[]): IEvent {
  const frozen: IEvent = {
    type: 'VEVENT',
    properties: Object.freeze([...properties]),
    alarms: Object.freeze([...alarms]),
    toString() {
      const children = this.alarms.map((a) => a.toString());
      return serializeComponent('VEVENT', this.properties, children);
    },
  };
  return Object.freeze(frozen);
}
