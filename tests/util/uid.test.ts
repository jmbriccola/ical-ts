import { generateUid } from '../../src/util/uid.js';

describe('generateUid', () => {
  it('generates a non-empty string', () => {
    const uid = generateUid();
    expect(uid.length).toBeGreaterThan(0);
  });

  it('generates unique values', () => {
    const uids = new Set(Array.from({ length: 100 }, () => generateUid()));
    expect(uids.size).toBe(100);
  });
});
