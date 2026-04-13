import type { Property } from '../types/property.js';
import type { IEvent } from './event.js';
import type { ITodo } from './todo.js';
import type { IJournal } from './journal.js';
import type { IFreeBusy } from './freebusy.js';
import type { ITimezone } from './timezone.js';
import { serializeComponent } from '../util/serialize.js';

/** Immutable representation of a VCALENDAR object. */
export interface ICalendar {
  readonly type: 'VCALENDAR';
  readonly properties: ReadonlyArray<Readonly<Property>>;
  readonly events: ReadonlyArray<IEvent>;
  readonly todos: ReadonlyArray<ITodo>;
  readonly journals: ReadonlyArray<IJournal>;
  readonly freeBusys: ReadonlyArray<IFreeBusy>;
  readonly timezones: ReadonlyArray<ITimezone>;
  toString(): string;
}

/** @internal */
export function createCalendar(
  properties: Property[],
  events: IEvent[],
  todos: ITodo[],
  journals: IJournal[],
  freeBusys: IFreeBusy[],
  timezones: ITimezone[],
): ICalendar {
  const frozen: ICalendar = {
    type: 'VCALENDAR',
    properties: Object.freeze([...properties]),
    events: Object.freeze([...events]),
    todos: Object.freeze([...todos]),
    journals: Object.freeze([...journals]),
    freeBusys: Object.freeze([...freeBusys]),
    timezones: Object.freeze([...timezones]),
    toString() {
      const children = [
        ...this.timezones.map((tz) => tz.toString()),
        ...this.events.map((e) => e.toString()),
        ...this.todos.map((t) => t.toString()),
        ...this.journals.map((j) => j.toString()),
        ...this.freeBusys.map((fb) => fb.toString()),
      ];
      return serializeComponent('VCALENDAR', this.properties, children);
    },
  };
  return Object.freeze(frozen);
}
