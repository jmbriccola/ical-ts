import { escapeText, foldLine, serializeProperty, serializeComponent } from '../../src/util/serialize.js';
import type { Property } from '../../src/types/property.js';

describe('escapeText', () => {
  it('escapes backslashes', () => {
    expect(escapeText('path\\to\\file')).toBe('path\\\\to\\\\file');
  });

  it('escapes semicolons', () => {
    expect(escapeText('a;b')).toBe('a\\;b');
  });

  it('escapes commas', () => {
    expect(escapeText('a,b')).toBe('a\\,b');
  });

  it('escapes newlines', () => {
    expect(escapeText('line1\nline2')).toBe('line1\\nline2');
  });

  it('escapes CRLF', () => {
    expect(escapeText('line1\r\nline2')).toBe('line1\\nline2');
  });

  it('handles combined escapes', () => {
    expect(escapeText('a\\b;c,d\ne')).toBe('a\\\\b\\;c\\,d\\ne');
  });

  it('returns empty string unchanged', () => {
    expect(escapeText('')).toBe('');
  });
});

describe('foldLine', () => {
  it('does not fold lines under 75 octets', () => {
    const line = 'SUMMARY:Short text';
    expect(foldLine(line)).toBe(line);
  });

  it('does not fold lines at exactly 75 octets', () => {
    const line = 'X'.repeat(75);
    expect(foldLine(line)).toBe(line);
  });

  it('folds lines over 75 octets', () => {
    const line = 'X'.repeat(100);
    const folded = foldLine(line);
    expect(folded).toContain('\r\n ');
    // Each unfolded segment should not exceed 75 bytes
    const segments = folded.split('\r\n ');
    expect(segments[0].length).toBeLessThanOrEqual(75);
    for (let i = 1; i < segments.length; i++) {
      // continuation lines: space (1 byte) + content <= 75 bytes, so content <= 74
      expect(segments[i].length).toBeLessThanOrEqual(74);
    }
  });

  it('handles multi-byte UTF-8 characters', () => {
    // Each emoji is 4 bytes in UTF-8
    const line = 'SUMMARY:' + '🎉'.repeat(20);
    const folded = foldLine(line);
    expect(folded).toContain('\r\n ');
  });
});

describe('serializeProperty', () => {
  it('serializes a simple property', () => {
    const prop: Property = { name: 'VERSION', value: '2.0', parameters: {} };
    expect(serializeProperty(prop)).toBe('VERSION:2.0');
  });

  it('serializes a property with parameters', () => {
    const prop: Property = {
      name: 'DTSTART',
      value: '20260413T090000',
      parameters: { TZID: 'Europe/Rome' },
    };
    expect(serializeProperty(prop)).toBe('DTSTART;TZID=Europe/Rome:20260413T090000');
  });

  it('serializes a property with array parameters', () => {
    const prop: Property = {
      name: 'ATTENDEE',
      value: 'mailto:dev@example.com',
      parameters: { ROLE: 'REQ-PARTICIPANT', RSVP: 'TRUE' },
    };
    const result = serializeProperty(prop);
    expect(result).toContain('ROLE=REQ-PARTICIPANT');
    expect(result).toContain('RSVP=TRUE');
  });

  it('escapes TEXT property values', () => {
    const prop: Property = {
      name: 'SUMMARY',
      value: 'Meeting; with, Bob\nand Alice',
      parameters: {},
    };
    expect(serializeProperty(prop)).toBe('SUMMARY:Meeting\\; with\\, Bob\\nand Alice');
  });

  it('does not escape non-TEXT property values', () => {
    const prop: Property = {
      name: 'DTSTART',
      value: '20260413T090000',
      parameters: {},
    };
    expect(serializeProperty(prop)).toBe('DTSTART:20260413T090000');
  });

  it('skips undefined parameters', () => {
    const prop: Property = {
      name: 'DTSTART',
      value: '20260413T090000',
      parameters: { TZID: undefined },
    };
    expect(serializeProperty(prop)).toBe('DTSTART:20260413T090000');
  });
});

describe('serializeComponent', () => {
  it('serializes a simple component', () => {
    const props: Property[] = [
      { name: 'VERSION', value: '2.0', parameters: {} },
    ];
    const result = serializeComponent('VCALENDAR', props);
    expect(result).toBe('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR\r\n');
  });

  it('serializes a component with children', () => {
    const props: Property[] = [];
    const children = ['BEGIN:VEVENT\r\nSUMMARY:Test\r\nEND:VEVENT\r\n'];
    const result = serializeComponent('VCALENDAR', props, children);
    expect(result).toContain('BEGIN:VCALENDAR');
    expect(result).toContain('BEGIN:VEVENT');
    expect(result).toContain('END:VEVENT');
    expect(result).toContain('END:VCALENDAR');
  });

  it('uses CRLF line endings throughout', () => {
    const props: Property[] = [
      { name: 'VERSION', value: '2.0', parameters: {} },
      { name: 'PRODID', value: '-//Test//EN', parameters: {} },
    ];
    const result = serializeComponent('VCALENDAR', props);
    const lines = result.split('\r\n');
    expect(lines[0]).toBe('BEGIN:VCALENDAR');
    expect(lines[1]).toBe('VERSION:2.0');
    expect(lines[2]).toBe('PRODID:-//Test//EN');
    expect(lines[3]).toBe('END:VCALENDAR');
  });
});
