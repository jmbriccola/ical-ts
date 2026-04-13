import type { Property } from '../types/property.js';
import { serializeComponent } from '../util/serialize.js';

/** Immutable representation of a VJOURNAL component. */
export interface IJournal {
  readonly type: 'VJOURNAL';
  readonly properties: ReadonlyArray<Readonly<Property>>;
  toString(): string;
}

/** @internal */
export function createJournal(properties: Property[]): IJournal {
  const frozen: IJournal = {
    type: 'VJOURNAL',
    properties: Object.freeze([...properties]),
    toString() {
      return serializeComponent('VJOURNAL', this.properties);
    },
  };
  return Object.freeze(frozen);
}
