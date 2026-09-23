import { NextResponse } from 'next/server';

/**
 * GET /api/tasks/tracking  (server-side proxy)
 *
 * Forwards the super-admin / agent task-tracking request to the backend
 * `GET /api/tasks/tracking`. The super admin sees EVERY task across all
 * agents (with live status + timer); an agent sees only their own tasks.
 *
 * Query params (e.g. ?agentId=, ?status=, ?date=) are passed through so the
 * frontend can filter the tracking view without hitting the backend twice.
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '').trim();

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { search } = new URL(req.url);

    const response = await fetch(`${process.env.BACKEND_URL}/api/tasks/tracking${search}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
