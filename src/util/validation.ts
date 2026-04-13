import type { Property } from '../types/property.js';

/**
 * Error thrown when iCal component validation fails during `.build()`.
 */
export class ICalValidationError extends Error {
  /** The property name that caused the validation failure. */
  readonly property: string;

  constructor(message: string, property: string) {
    super(message);
    this.name = 'ICalValidationError';
    this.property = property;
  }
}

/**
 * Assert that a required property is present in the property list.
 * @throws {ICalValidationError} if the property is missing
 */
export function requireProperty(
  properties: readonly Property[],
  name: string,
  componentName: string,
): void {
  const found = properties.some((p) => p.name === name);
  if (!found) {
    throw new ICalValidationError(
      `${componentName} requires a ${name} property`,
      name,
    );
  }
}

/**
 * Assert that two mutually exclusive properties are not both present.
 * @throws {ICalValidationError} if both properties exist
 */
export function mutuallyExclusive(
  properties: readonly Property[],
  nameA: string,
  nameB: string,
  componentName: string,
): void {
  const hasA = properties.some((p) => p.name === nameA);
  const hasB = properties.some((p) => p.name === nameB);
  if (hasA && hasB) {
    throw new ICalValidationError(
      `${componentName}: ${nameA} and ${nameB} are mutually exclusive`,
      `${nameA}/${nameB}`,
    );
  }
}
