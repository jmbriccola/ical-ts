import type {
  TextPropertyOptions,
  OrganizerOptions,
  AttendeeOptions,
} from '../types/options.js';

/** Build parameter record for text properties (ALTREP, LANGUAGE). */
export function buildTextParams(opts?: TextPropertyOptions): Record<string, string> {
  const params: Record<string, string> = {};
  if (!opts) return params;
  if (opts.altrep) params['ALTREP'] = `"${opts.altrep}"`;
  if (opts.language) params['LANGUAGE'] = opts.language;
  return params;
}

/** Build parameter record for ORGANIZER property. */
export function buildOrganizerParams(opts?: OrganizerOptions): Record<string, string> {
  const params: Record<string, string> = {};
  if (!opts) return params;
  if (opts.cn) params['CN'] = opts.cn;
  if (opts.sentBy) params['SENT-BY'] = `"mailto:${opts.sentBy}"`;
  if (opts.dir) params['DIR'] = `"${opts.dir}"`;
  if (opts.language) params['LANGUAGE'] = opts.language;
  return params;
}

/** Build parameter record for ATTENDEE property. */
export function buildAttendeeParams(opts?: AttendeeOptions): Record<string, string> {
  const params: Record<string, string> = {};
  if (!opts) return params;
  if (opts.cn) params['CN'] = opts.cn;
  if (opts.role) params['ROLE'] = opts.role;
  if (opts.partstat) params['PARTSTAT'] = opts.partstat;
  if (opts.rsvp !== undefined) params['RSVP'] = opts.rsvp ? 'TRUE' : 'FALSE';
  if (opts.cutype) params['CUTYPE'] = opts.cutype;
  if (opts.delegatedTo) params['DELEGATED-TO'] = `"mailto:${opts.delegatedTo}"`;
  if (opts.delegatedFrom) params['DELEGATED-FROM'] = `"mailto:${opts.delegatedFrom}"`;
  if (opts.sentBy) params['SENT-BY'] = `"mailto:${opts.sentBy}"`;
  if (opts.dir) params['DIR'] = `"${opts.dir}"`;
  if (opts.member) params['MEMBER'] = `"mailto:${opts.member}"`;
  if (opts.language) params['LANGUAGE'] = opts.language;
  return params;
}
