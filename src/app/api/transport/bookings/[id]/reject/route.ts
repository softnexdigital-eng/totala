import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/serverAuth';

const BACKEND = process.env.BACKEND_URL;

async function backendJson(
  input: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: any }> {
  try {
    const token = await getAuthToken();
    const res = await fetch(input, {
      ...init,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init?.headers as Record<string, string> | undefined),
      },
      cache: 'no-store',
    });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { ok: false, status: res.status, data: null };
    }
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const result = await backendJson(`${BACKEND}/api/transport/bookings/${params.id}/reject`, {
    method: 'PUT',
  });

  return NextResponse.json(
    result.data || { success: false, message: 'Failed to reject booking' },
    { status: result.status || 500 }
  );
}
