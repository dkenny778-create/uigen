// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

// Mock server-only so it doesn't throw outside Next.js
vi.mock("server-only", () => ({}));

// Mock next/headers cookies
const mockSet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ set: mockSet })),
}));

const { createSession } = await import("@/lib/auth");

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

beforeEach(() => {
  mockSet.mockClear();
});

test("createSession sets a cookie with the correct name", async () => {
  await createSession("user-1", "test@example.com");

  expect(mockSet).toHaveBeenCalledOnce();
  const [cookieName] = mockSet.mock.calls[0];
  expect(cookieName).toBe("auth-token");
});

test("createSession sets httpOnly, sameSite, and path correctly", async () => {
  await createSession("user-1", "test@example.com");

  const [, , options] = mockSet.mock.calls[0];
  expect(options.httpOnly).toBe(true);
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
});

test("createSession sets secure:false in non-production", async () => {
  vi.stubEnv("NODE_ENV", "test");
  await createSession("user-1", "test@example.com");

  const [, , options] = mockSet.mock.calls[0];
  expect(options.secure).toBe(false);
  vi.unstubAllEnvs();
});

test("createSession sets secure:true in production", async () => {
  vi.stubEnv("NODE_ENV", "production");
  await createSession("user-1", "test@example.com");

  const [, , options] = mockSet.mock.calls[0];
  expect(options.secure).toBe(true);
  vi.unstubAllEnvs();
});

test("createSession sets cookie expiry ~7 days from now", async () => {
  const before = Date.now();
  await createSession("user-1", "test@example.com");
  const after = Date.now();

  const [, , options] = mockSet.mock.calls[0];
  const expires: Date = options.expires;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  expect(expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
  expect(expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
});

test("createSession token is a valid JWT containing userId and email", async () => {
  await createSession("user-42", "hello@example.com");

  const [, token] = mockSet.mock.calls[0];
  const { payload } = await jwtVerify(token, JWT_SECRET);

  expect(payload.userId).toBe("user-42");
  expect(payload.email).toBe("hello@example.com");
});

test("createSession token expires in ~7 days", async () => {
  const before = Math.floor(Date.now() / 1000);
  await createSession("user-1", "test@example.com");
  const after = Math.floor(Date.now() / 1000);

  const [, token] = mockSet.mock.calls[0];
  const { payload } = await jwtVerify(token, JWT_SECRET);

  const sevenDays = 7 * 24 * 60 * 60;
  expect(payload.exp).toBeGreaterThanOrEqual(before + sevenDays - 5);
  expect(payload.exp).toBeLessThanOrEqual(after + sevenDays + 5);
});
