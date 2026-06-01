import type { NextRequest } from 'next/server';
import { TextEncoder as NodeTextEncoder } from 'util';

// jsdom test env lacks some Node/web globals auth.ts relies on.
if (!(globalThis as any).TextEncoder) {
  (globalThis as any).TextEncoder = NodeTextEncoder;
}
if (!(globalThis as any).Response) {
  (globalThis as any).Response = class {
    status: number;
    body: unknown;
    constructor(body: unknown, init?: { status?: number }) {
      this.body = body;
      this.status = init?.status ?? 200;
    }
  };
}

const findUnique = jest.fn();
const getTenantFromHostname = jest.fn();
const jwtVerify = jest.fn();

jest.mock('@/lib/db', () => ({
  db: { user: { findUnique: (...args: unknown[]) => findUnique(...args) } },
}));
jest.mock('@/lib/tenant', () => ({
  getTenantFromHostname: (...args: unknown[]) => getTenantFromHostname(...args),
}));
jest.mock('jose', () => ({
  jwtVerify: (...args: unknown[]) => jwtVerify(...args),
}));

import {
  getAuthUser,
  getJwtSecret,
  requireAdmin,
  requireSuperAdmin,
} from '@/lib/auth';

const SECRET = 'a'.repeat(40);

function makeRequest(token?: string, host = 'shop.example.com'): NextRequest {
  return {
    cookies: { get: () => (token ? { value: token } : undefined) },
    headers: {
      get: (k: string) =>
        k === 'x-tenant-hostname' || k === 'host' ? host : null,
    },
  } as unknown as NextRequest;
}

const okHandler = async () => new Response('ok', { status: 200 });

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = SECRET;
});

describe('getJwtSecret', () => {
  it('throws when the secret is unset', () => {
    delete process.env.JWT_SECRET;
    expect(() => getJwtSecret()).toThrow();
  });

  it('throws when the secret is too short', () => {
    process.env.JWT_SECRET = 'short';
    expect(() => getJwtSecret()).toThrow();
  });

  it('returns bytes for a valid secret', () => {
    const bytes = getJwtSecret();
    expect(ArrayBuffer.isView(bytes)).toBe(true);
    expect(bytes.length).toBe(SECRET.length);
  });
});

describe('getAuthUser tenant binding', () => {
  it('returns null without a token', async () => {
    expect(await getAuthUser(makeRequest(undefined))).toBeNull();
  });

  it('returns the user when token, user, and request tenant all match', async () => {
    jwtVerify.mockResolvedValue({ payload: { userId: 'u1', tenantId: 't1' } });
    findUnique.mockResolvedValue({
      id: 'u1',
      email: 'e',
      name: 'n',
      role: 'CUSTOMER',
      tenantId: 't1',
    });
    getTenantFromHostname.mockResolvedValue({ id: 't1' });

    expect(await getAuthUser(makeRequest('tok'))).toMatchObject({
      id: 'u1',
      tenantId: 't1',
    });
  });

  it('rejects a token presented against a different tenant', async () => {
    jwtVerify.mockResolvedValue({ payload: { userId: 'u1', tenantId: 't1' } });
    findUnique.mockResolvedValue({
      id: 'u1',
      email: 'e',
      name: 'n',
      role: 'CUSTOMER',
      tenantId: 't1',
    });
    getTenantFromHostname.mockResolvedValue({ id: 't2' });

    expect(await getAuthUser(makeRequest('tok'))).toBeNull();
  });

  it('rejects when the token tenant does not match the user tenant', async () => {
    jwtVerify.mockResolvedValue({ payload: { userId: 'u1', tenantId: 'tX' } });
    findUnique.mockResolvedValue({
      id: 'u1',
      email: 'e',
      name: 'n',
      role: 'CUSTOMER',
      tenantId: 't1',
    });
    getTenantFromHostname.mockResolvedValue({ id: 't1' });

    expect(await getAuthUser(makeRequest('tok'))).toBeNull();
  });

  it('exempts SUPER_ADMIN from tenant binding', async () => {
    jwtVerify.mockResolvedValue({
      payload: { userId: 'sa', tenantId: 'home' },
    });
    findUnique.mockResolvedValue({
      id: 'sa',
      email: 'e',
      name: 'n',
      role: 'SUPER_ADMIN',
      tenantId: 'home',
    });

    const user = await getAuthUser(makeRequest('tok'));
    expect(user).toMatchObject({ role: 'SUPER_ADMIN' });
    // Super admin short-circuits before resolving the request tenant.
    expect(getTenantFromHostname).not.toHaveBeenCalled();
  });

  it('returns null when the user no longer exists', async () => {
    jwtVerify.mockResolvedValue({ payload: { userId: 'u1', tenantId: 't1' } });
    findUnique.mockResolvedValue(null);
    expect(await getAuthUser(makeRequest('tok'))).toBeNull();
  });

  it('returns null when token verification throws', async () => {
    jwtVerify.mockRejectedValue(new Error('bad signature'));
    expect(await getAuthUser(makeRequest('tok'))).toBeNull();
  });
});

describe('requireAdmin / requireSuperAdmin', () => {
  const asAdmin = (role: string, tenantId = 't1') => {
    jwtVerify.mockResolvedValue({ payload: { userId: 'x', tenantId } });
    findUnique.mockResolvedValue({
      id: 'x',
      email: 'e',
      name: 'n',
      role,
      tenantId,
    });
    getTenantFromHostname.mockResolvedValue({ id: tenantId });
  };

  it('requireAdmin returns 401 without a token', async () => {
    const res = await requireAdmin(okHandler)(makeRequest(undefined));
    expect(res.status).toBe(401);
  });

  it('requireAdmin returns 403 for a customer', async () => {
    asAdmin('CUSTOMER');
    const res = await requireAdmin(okHandler)(makeRequest('tok'));
    expect(res.status).toBe(403);
  });

  it('requireAdmin allows ADMIN and SUPER_ADMIN', async () => {
    asAdmin('ADMIN');
    expect((await requireAdmin(okHandler)(makeRequest('tok'))).status).toBe(
      200
    );
    asAdmin('SUPER_ADMIN', 'home');
    expect((await requireAdmin(okHandler)(makeRequest('tok'))).status).toBe(
      200
    );
  });

  it('requireSuperAdmin rejects ADMIN but allows SUPER_ADMIN', async () => {
    asAdmin('ADMIN');
    expect(
      (await requireSuperAdmin(okHandler)(makeRequest('tok'))).status
    ).toBe(403);
    asAdmin('SUPER_ADMIN', 'home');
    expect(
      (await requireSuperAdmin(okHandler)(makeRequest('tok'))).status
    ).toBe(200);
  });
});
