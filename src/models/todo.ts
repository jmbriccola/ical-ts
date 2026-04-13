import type { Property } from '../types/property.js';
import type { IAlarm } from './alarm.js';
import { serializeComponent } from '../util/serialize.js';

/** Immutable representation of a VTODO component. */
export interface ITodo {
  readonly type: 'VTODO';
  readonly properties: ReadonlyArray<Readonly<Property>>;
  readonly alarms: ReadonlyArray<IAlarm>;
  toString(): string;
}

/** @internal */
export function createTodo(properties: Property[], alarms: IAlarm[]): ITodo {
  const frozen: ITodo = {
    type: 'VTODO',
    properties: Object.freeze([...properties]),
    alarms: Object.freeze([...alarms]),
    toString() {
      const children = this.alarms.map((a) => a.toString());
      return serializeComponent('VTODO', this.properties, children);
    },
  };
  return Object.freeze(frozen);
}
