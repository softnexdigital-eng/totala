import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.toString();

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/public-agents${query ? `?${query}` : ''}`,
      {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
