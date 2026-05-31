import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";

// --- Unified API Response ---
export function success(data: any = null, message: string = "ok") {
  return NextResponse.json({ code: 0, data, message });
}

export function error(code: number, message: string, status: number = 400) {
  return NextResponse.json({ code, data: null, message }, { status });
}

// --- Zod Validation Helper ---
export function validate<T>(schema: ZodSchema<T>, data: unknown): { data: T } | { error: NextResponse } {
  try {
    const parsed = schema.parse(data);
    return { data: parsed };
  } catch (err) {
    if (err instanceof ZodError) {
      const msg = err.errors.map((e) => e.message).join(", ");
      return { error: error(40001, msg, 400) };
    }
    return { error: error(40001, "Invalid input", 400) };
  }
}

// --- Simple Rate Limiter (in-memory, per IP) ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (entry.count >= maxAttempts) {
    return false; // blocked
  }

  entry.count++;
  return true; // allowed
}

export function rateLimitError() {
  return error(42901, "Too many requests, please try again later", 429);
}

// --- Get client IP from request ---
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
