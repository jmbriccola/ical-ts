import type { Property } from '../types/property.js';

const encoder = new TextEncoder();

/**
 * Escape a TEXT value per RFC 5545 Section 3.3.11.
 * Backslash, semicolon, comma, and newlines are escaped.
 */
export function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

/** Set of property names whose values are TEXT and need escaping. */
const TEXT_PROPERTIES = new Set([
  'SUMMARY',
  'DESCRIPTION',
  'LOCATION',
  'COMMENT',
  'CONTACT',
  'RELATED-TO',
  'X-ALT-DESC',
]);

/** Returns true if the given property name holds a TEXT value that needs escaping. */
function isTextProperty(name: string): boolean {
  return TEXT_PROPERTIES.has(name) || name.startsWith('X-');
}

/**
 * Fold a content line to respect the 75-octet limit per RFC 5545 Section 3.1.
 * Long lines are split by inserting CRLF followed by a single space.
 * Operates on UTF-8 byte length to handle multi-byte characters correctly.
 */
export function foldLine(line: string): string {
  const bytes = encoder.encode(line);
  if (bytes.length <= 75) {
    return line;
  }

  const parts: string[] = [];
  let currentStart = 0;
  let currentByteLen = 0;
  const maxFirst = 75;
  const maxContinuation = 74; // continuation lines start with a space (1 byte)

  for (let i = 0; i < line.length; i++) {
    const charBytes = encoder.encode(line[i]).length;
    const limit = parts.length === 0 ? maxFirst : maxContinuation;

    if (currentByteLen + charBytes > limit) {
      parts.push(line.slice(currentStart, i));
      currentStart = i;
      currentByteLen = 0;
    }
    currentByteLen += charBytes;
  }

  if (currentStart < line.length) {
    parts.push(line.slice(currentStart));
  }

  return parts.join('\r\n ');
}

/**
 * Serialize a single iCalendar property to a content line.
 * Handles parameter formatting, text escaping, and line folding.
 */
export function serializeProperty(prop: Property): string {
  let line = prop.name;

  // Append parameters
  for (const [key, val] of Object.entries(prop.parameters)) {
    if (val === undefined) continue;
    if (Array.isArray(val)) {
      line += `;${key}=${val.join(',')}`;
    } else {
      line += `;${key}=${val}`;
    }
  }

  // Append value (escape TEXT properties)
  const value = isTextProperty(prop.name) ? escapeText(prop.value) : prop.value;
  line += `:${value}`;

  return foldLine(line);
}

/**
 * Serialize a complete iCalendar component (e.g. VCALENDAR, VEVENT).
 * Wraps properties and child components in BEGIN/END delimiters.
 *
 * @param name - Component name (e.g. `'VCALENDAR'`, `'VEVENT'`)
 * @param properties - Array of properties for this component
 * @param children - Pre-serialized child component strings
 * @returns The full serialized component with CRLF line endings
 */
export function serializeComponent(
  name: string,
  properties: readonly Property[],
  children: readonly string[] = [],
): string {
  const lines: string[] = [];
  lines.push(`BEGIN:${name}`);

  for (const prop of properties) {
    lines.push(serializeProperty(prop));
  }

  for (const child of children) {
    // Children are already serialized with CRLF; strip trailing CRLF to avoid double
    lines.push(child.replace(/\r\n$/, ''));
  }

  lines.push(`END:${name}`);
  return lines.join('\r\n') + '\r\n';
}
