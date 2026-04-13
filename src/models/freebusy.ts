import type { Property } from '../types/property.js';
import { serializeComponent } from '../util/serialize.js';

/** Immutable representation of a VFREEBUSY component. */
export interface IFreeBusy {
  readonly type: 'VFREEBUSY';
  readonly properties: ReadonlyArray<Readonly<Property>>;
  toString(): string;
}

/** @internal */
export function createFreeBusy(properties: Property[]): IFreeBusy {
  const frozen: IFreeBusy = {
    type: 'VFREEBUSY',
    properties: Object.freeze([...properties]),
    toString() {
      return serializeComponent('VFREEBUSY', this.properties);
    },
  };
  return Object.freeze(frozen);
}
