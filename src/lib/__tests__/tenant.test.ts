// db is imported transitively by tenant.ts; stub it so importing the module
// doesn't spin up a real Postgres pool.
jest.mock('@/lib/db', () => ({ db: {} }));

import { extractSubdomain } from '@/lib/tenant';

describe('extractSubdomain', () => {
  it('treats localhost as the default tenant', () => {
    expect(extractSubdomain('localhost')).toBe('default');
    expect(extractSubdomain('localhost:3000')).toBe('default');
    expect(extractSubdomain('127.0.0.1')).toBe('default');
  });

  it('treats an apex domain as the default tenant', () => {
    expect(extractSubdomain('minakitchen.com')).toBe('default');
    expect(extractSubdomain('minakitchen.com:443')).toBe('default');
  });

  it('extracts the leading label as the subdomain', () => {
    expect(extractSubdomain('jollofhub.minakitchen.com')).toBe('jollofhub');
    expect(extractSubdomain('jollofhub.minakitchen.com:3000')).toBe(
      'jollofhub'
    );
  });
});
