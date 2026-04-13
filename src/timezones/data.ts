/**
 * IANA timezone definitions with current DST rules.
 *
 * Each entry contains the data needed to build a VTIMEZONE component:
 * - id: IANA timezone identifier
 * - standard: STANDARD observance rule
 * - daylight: DAYLIGHT observance rule (omitted for zones without DST)
 *
 * Offset format: `+HHMM` or `-HHMM`
 * RRULE uses current rules (post-2007 for most zones).
 */

export interface TimezoneRuleData {
  readonly dtstart: string;       // e.g. '19701025T030000'
  readonly offsetFrom: string;    // e.g. '+0200'
  readonly offsetTo: string;      // e.g. '+0100'
  readonly tzName: string;        // e.g. 'CET'
  readonly rrule?: string;        // e.g. 'FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10'
}

export interface TimezoneData {
  readonly id: string;
  readonly standard: TimezoneRuleData;
  readonly daylight?: TimezoneRuleData;
}

// ──────────────────────────────────────────────
//  Helper: build a yearly DST rrule
// ──────────────────────────────────────────────
function rrule(month: number, day: string): string {
  return `FREQ=YEARLY;BYDAY=${day};BYMONTH=${month}`;
}

// ──────────────────────────────────────────────
//  EUROPE
// ──────────────────────────────────────────────

// Most of Europe uses EU rules: DST starts last Sunday of March at 01:00 UTC,
// ends last Sunday of October at 01:00 UTC.
function euZone(id: string, stdOffset: string, dstOffset: string, stdName: string, dstName: string, stdHour: number, dstHour: number): TimezoneData {
  return {
    id,
    standard: {
      dtstart: `19701025T${String(dstHour + 1).padStart(2, '0')}0000`,
      offsetFrom: dstOffset,
      offsetTo: stdOffset,
      tzName: stdName,
      rrule: rrule(10, '-1SU'),
    },
    daylight: {
      dtstart: `19700329T${String(stdHour + 1).padStart(2, '0')}0000`,
      offsetFrom: stdOffset,
      offsetTo: dstOffset,
      tzName: dstName,
      rrule: rrule(3, '-1SU'),
    },
  };
}

// CET/CEST zones (UTC+1/+2)
const CET_ZONES: TimezoneData[] = [
  'Europe/Amsterdam', 'Europe/Andorra', 'Europe/Belgrade', 'Europe/Berlin',
  'Europe/Brussels', 'Europe/Budapest', 'Europe/Copenhagen', 'Europe/Ljubljana',
  'Europe/Luxembourg', 'Europe/Madrid', 'Europe/Malta', 'Europe/Monaco',
  'Europe/Oslo', 'Europe/Paris', 'Europe/Prague', 'Europe/Rome',
  'Europe/Stockholm', 'Europe/Tirane', 'Europe/Vienna', 'Europe/Warsaw',
  'Europe/Zagreb', 'Europe/Zurich',
].map((id) => euZone(id, '+0100', '+0200', 'CET', 'CEST', 1, 2));

// EET/EEST zones (UTC+2/+3)
const EET_ZONES: TimezoneData[] = [
  'Europe/Athens', 'Europe/Bucharest', 'Europe/Helsinki',
  'Europe/Kyiv', 'Europe/Riga', 'Europe/Sofia', 'Europe/Tallinn', 'Europe/Vilnius',
].map((id) => euZone(id, '+0200', '+0300', 'EET', 'EEST', 2, 3));

// WET/WEST zones (UTC+0/+1)
const WET_ZONES: TimezoneData[] = [
  'Europe/Lisbon',
].map((id) => euZone(id, '+0000', '+0100', 'WET', 'WEST', 0, 1));

const EUROPE_OTHER: TimezoneData[] = [
  // UK: GMT/BST — same EU DST dates but different names
  euZone('Europe/London', '+0000', '+0100', 'GMT', 'BST', 0, 1),
  // Ireland: IST/GMT
  euZone('Europe/Dublin', '+0100', '+0000', 'IST', 'GMT', 1, 0),
  // Turkey: no DST since 2016
  { id: 'Europe/Istanbul', standard: { dtstart: '19700101T000000', offsetFrom: '+0300', offsetTo: '+0300', tzName: 'TRT' } },
  // Moscow: no DST since 2014
  { id: 'Europe/Moscow', standard: { dtstart: '19700101T000000', offsetFrom: '+0300', offsetTo: '+0300', tzName: 'MSK' } },
  // Belarus: no DST since 2011
  { id: 'Europe/Minsk', standard: { dtstart: '19700101T000000', offsetFrom: '+0300', offsetTo: '+0300', tzName: 'MSK' } },
];

// ──────────────────────────────────────────────
//  AMERICAS
// ──────────────────────────────────────────────

// US/Canada DST: 2nd Sunday of March at 02:00, 1st Sunday of November at 02:00
function usZone(id: string, stdOffset: string, dstOffset: string, stdName: string, dstName: string): TimezoneData {
  return {
    id,
    standard: {
      dtstart: '19701101T020000',
      offsetFrom: dstOffset,
      offsetTo: stdOffset,
      tzName: stdName,
      rrule: rrule(11, '1SU'),
    },
    daylight: {
      dtstart: '19700308T020000',
      offsetFrom: stdOffset,
      offsetTo: dstOffset,
      tzName: dstName,
      rrule: rrule(3, '2SU'),
    },
  };
}

const US_ZONES: TimezoneData[] = [
  usZone('America/New_York', '-0500', '-0400', 'EST', 'EDT'),
  usZone('America/Chicago', '-0600', '-0500', 'CST', 'CDT'),
  usZone('America/Denver', '-0700', '-0600', 'MST', 'MDT'),
  usZone('America/Los_Angeles', '-0800', '-0700', 'PST', 'PDT'),
  usZone('America/Anchorage', '-0900', '-0800', 'AKST', 'AKDT'),
  usZone('America/Toronto', '-0500', '-0400', 'EST', 'EDT'),
  usZone('America/Vancouver', '-0800', '-0700', 'PST', 'PDT'),
  usZone('America/Winnipeg', '-0600', '-0500', 'CST', 'CDT'),
  usZone('America/Edmonton', '-0700', '-0600', 'MST', 'MDT'),
  usZone('America/Halifax', '-0400', '-0300', 'AST', 'ADT'),
];

const AMERICAS_OTHER: TimezoneData[] = [
  // Mexico City: same US DST rules
  usZone('America/Mexico_City', '-0600', '-0500', 'CST', 'CDT'),
  // Havana: 2nd Sunday Mar/1st Sunday Nov
  usZone('America/Havana', '-0500', '-0400', 'CST', 'CDT'),
  // No DST zones
  { id: 'America/Phoenix', standard: { dtstart: '19700101T000000', offsetFrom: '-0700', offsetTo: '-0700', tzName: 'MST' } },
  { id: 'America/Bogota', standard: { dtstart: '19700101T000000', offsetFrom: '-0500', offsetTo: '-0500', tzName: 'COT' } },
  { id: 'America/Lima', standard: { dtstart: '19700101T000000', offsetFrom: '-0500', offsetTo: '-0500', tzName: 'PET' } },
  { id: 'America/Caracas', standard: { dtstart: '19700101T000000', offsetFrom: '-0400', offsetTo: '-0400', tzName: 'VET' } },
  { id: 'America/Argentina/Buenos_Aires', standard: { dtstart: '19700101T000000', offsetFrom: '-0300', offsetTo: '-0300', tzName: 'ART' } },
  { id: 'America/Sao_Paulo', standard: { dtstart: '19700101T000000', offsetFrom: '-0300', offsetTo: '-0300', tzName: 'BRT' } },
  { id: 'Pacific/Honolulu', standard: { dtstart: '19700101T000000', offsetFrom: '-1000', offsetTo: '-1000', tzName: 'HST' } },
  // Santiago: DST first Saturday of April -> first Saturday of September (southern hemisphere)
  {
    id: 'America/Santiago',
    standard: {
      dtstart: '19700404T000000',
      offsetFrom: '-0300',
      offsetTo: '-0400',
      tzName: 'CLT',
      rrule: rrule(4, '1SA'),
    },
    daylight: {
      dtstart: '19700905T000000',
      offsetFrom: '-0400',
      offsetTo: '-0300',
      tzName: 'CLST',
      rrule: rrule(9, '1SA'),
    },
  },
];

// ──────────────────────────────────────────────
//  ASIA
// ──────────────────────────────────────────────

const ASIA_ZONES: TimezoneData[] = [
  { id: 'Asia/Tokyo', standard: { dtstart: '19700101T000000', offsetFrom: '+0900', offsetTo: '+0900', tzName: 'JST' } },
  { id: 'Asia/Shanghai', standard: { dtstart: '19700101T000000', offsetFrom: '+0800', offsetTo: '+0800', tzName: 'CST' } },
  { id: 'Asia/Hong_Kong', standard: { dtstart: '19700101T000000', offsetFrom: '+0800', offsetTo: '+0800', tzName: 'HKT' } },
  { id: 'Asia/Taipei', standard: { dtstart: '19700101T000000', offsetFrom: '+0800', offsetTo: '+0800', tzName: 'CST' } },
  { id: 'Asia/Singapore', standard: { dtstart: '19700101T000000', offsetFrom: '+0800', offsetTo: '+0800', tzName: 'SGT' } },
  { id: 'Asia/Seoul', standard: { dtstart: '19700101T000000', offsetFrom: '+0900', offsetTo: '+0900', tzName: 'KST' } },
  { id: 'Asia/Kolkata', standard: { dtstart: '19700101T000000', offsetFrom: '+0530', offsetTo: '+0530', tzName: 'IST' } },
  { id: 'Asia/Dubai', standard: { dtstart: '19700101T000000', offsetFrom: '+0400', offsetTo: '+0400', tzName: 'GST' } },
  { id: 'Asia/Riyadh', standard: { dtstart: '19700101T000000', offsetFrom: '+0300', offsetTo: '+0300', tzName: 'AST' } },
  { id: 'Asia/Bangkok', standard: { dtstart: '19700101T000000', offsetFrom: '+0700', offsetTo: '+0700', tzName: 'ICT' } },
  { id: 'Asia/Jakarta', standard: { dtstart: '19700101T000000', offsetFrom: '+0700', offsetTo: '+0700', tzName: 'WIB' } },
  { id: 'Asia/Manila', standard: { dtstart: '19700101T000000', offsetFrom: '+0800', offsetTo: '+0800', tzName: 'PHT' } },
  { id: 'Asia/Karachi', standard: { dtstart: '19700101T000000', offsetFrom: '+0500', offsetTo: '+0500', tzName: 'PKT' } },
  { id: 'Asia/Dhaka', standard: { dtstart: '19700101T000000', offsetFrom: '+0600', offsetTo: '+0600', tzName: 'BST' } },
  { id: 'Asia/Kathmandu', standard: { dtstart: '19700101T000000', offsetFrom: '+0545', offsetTo: '+0545', tzName: 'NPT' } },
  { id: 'Asia/Colombo', standard: { dtstart: '19700101T000000', offsetFrom: '+0530', offsetTo: '+0530', tzName: 'IST' } },
  { id: 'Asia/Kuala_Lumpur', standard: { dtstart: '19700101T000000', offsetFrom: '+0800', offsetTo: '+0800', tzName: 'MYT' } },
  { id: 'Asia/Ho_Chi_Minh', standard: { dtstart: '19700101T000000', offsetFrom: '+0700', offsetTo: '+0700', tzName: 'ICT' } },
  // Israel: DST last Friday of March -> last Sunday of October
  {
    id: 'Asia/Jerusalem',
    standard: {
      dtstart: '19701025T020000',
      offsetFrom: '+0300',
      offsetTo: '+0200',
      tzName: 'IST',
      rrule: rrule(10, '-1SU'),
    },
    daylight: {
      dtstart: '19700327T020000',
      offsetFrom: '+0200',
      offsetTo: '+0300',
      tzName: 'IDT',
      rrule: rrule(3, '-1FR'),
    },
  },
];

// ──────────────────────────────────────────────
//  OCEANIA
// ──────────────────────────────────────────────

// Australia DST: 1st Sunday of October -> 1st Sunday of April (southern hemisphere)
function auZone(id: string, stdOffset: string, dstOffset: string, stdName: string, dstName: string): TimezoneData {
  return {
    id,
    standard: {
      dtstart: '19700405T030000',
      offsetFrom: dstOffset,
      offsetTo: stdOffset,
      tzName: stdName,
      rrule: rrule(4, '1SU'),
    },
    daylight: {
      dtstart: '19701004T020000',
      offsetFrom: stdOffset,
      offsetTo: dstOffset,
      tzName: dstName,
      rrule: rrule(10, '1SU'),
    },
  };
}

const OCEANIA_ZONES: TimezoneData[] = [
  auZone('Australia/Sydney', '+1000', '+1100', 'AEST', 'AEDT'),
  auZone('Australia/Melbourne', '+1000', '+1100', 'AEST', 'AEDT'),
  auZone('Australia/Hobart', '+1000', '+1100', 'AEST', 'AEDT'),
  auZone('Australia/Adelaide', '+0930', '+1030', 'ACST', 'ACDT'),
  // No DST
  { id: 'Australia/Brisbane', standard: { dtstart: '19700101T000000', offsetFrom: '+1000', offsetTo: '+1000', tzName: 'AEST' } },
  { id: 'Australia/Perth', standard: { dtstart: '19700101T000000', offsetFrom: '+0800', offsetTo: '+0800', tzName: 'AWST' } },
  { id: 'Australia/Darwin', standard: { dtstart: '19700101T000000', offsetFrom: '+0930', offsetTo: '+0930', tzName: 'ACST' } },
  // New Zealand: last Sunday of September -> 1st Sunday of April
  {
    id: 'Pacific/Auckland',
    standard: {
      dtstart: '19700405T030000',
      offsetFrom: '+1300',
      offsetTo: '+1200',
      tzName: 'NZST',
      rrule: rrule(4, '1SU'),
    },
    daylight: {
      dtstart: '19700927T020000',
      offsetFrom: '+1200',
      offsetTo: '+1300',
      tzName: 'NZDT',
      rrule: rrule(9, '-1SU'),
    },
  },
  { id: 'Pacific/Fiji', standard: { dtstart: '19700101T000000', offsetFrom: '+1200', offsetTo: '+1200', tzName: 'FJT' } },
];

// ──────────────────────────────────────────────
//  AFRICA
// ──────────────────────────────────────────────

const AFRICA_ZONES: TimezoneData[] = [
  { id: 'Africa/Cairo', standard: { dtstart: '19700101T000000', offsetFrom: '+0200', offsetTo: '+0200', tzName: 'EET' } },
  { id: 'Africa/Johannesburg', standard: { dtstart: '19700101T000000', offsetFrom: '+0200', offsetTo: '+0200', tzName: 'SAST' } },
  { id: 'Africa/Lagos', standard: { dtstart: '19700101T000000', offsetFrom: '+0100', offsetTo: '+0100', tzName: 'WAT' } },
  { id: 'Africa/Nairobi', standard: { dtstart: '19700101T000000', offsetFrom: '+0300', offsetTo: '+0300', tzName: 'EAT' } },
  { id: 'Africa/Casablanca', standard: { dtstart: '19700101T000000', offsetFrom: '+0100', offsetTo: '+0100', tzName: 'WEST' } },
  { id: 'Africa/Accra', standard: { dtstart: '19700101T000000', offsetFrom: '+0000', offsetTo: '+0000', tzName: 'GMT' } },
  { id: 'Africa/Addis_Ababa', standard: { dtstart: '19700101T000000', offsetFrom: '+0300', offsetTo: '+0300', tzName: 'EAT' } },
  { id: 'Africa/Algiers', standard: { dtstart: '19700101T000000', offsetFrom: '+0100', offsetTo: '+0100', tzName: 'CET' } },
  { id: 'Africa/Tunis', standard: { dtstart: '19700101T000000', offsetFrom: '+0100', offsetTo: '+0100', tzName: 'CET' } },
];

// ──────────────────────────────────────────────
//  UTC
// ──────────────────────────────────────────────

const UTC_ZONE: TimezoneData = {
  id: 'UTC',
  standard: { dtstart: '19700101T000000', offsetFrom: '+0000', offsetTo: '+0000', tzName: 'UTC' },
};

// ──────────────────────────────────────────────
//  FULL DATABASE
// ──────────────────────────────────────────────

export const TIMEZONE_DATABASE: readonly TimezoneData[] = [
  UTC_ZONE,
  ...CET_ZONES,
  ...EET_ZONES,
  ...WET_ZONES,
  ...EUROPE_OTHER,
  ...US_ZONES,
  ...AMERICAS_OTHER,
  ...ASIA_ZONES,
  ...OCEANIA_ZONES,
  ...AFRICA_ZONES,
];
