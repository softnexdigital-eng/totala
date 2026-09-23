import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/serverAuth';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { paymentStatus } = body;

    if (!paymentStatus) {
      return NextResponse.json(
        { success: false, message: 'Payment status is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.BACKEND_URL}/api/payments/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ paymentStatus }),
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
