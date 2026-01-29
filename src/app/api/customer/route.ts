import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { api } from '@/lib/api';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const customerData = await api.getCustomerByEmail(session.user.email);

    if (!customerData) {
      return NextResponse.json({
        customer: {
          id: session.user.id,
          email: session.user.email,
        },
        gateways: [],
        channels: [],
      });
    }

    return NextResponse.json(customerData);
  } catch (error) {
    console.error('Customer fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer data' },
      { status: 500 }
    );
  }
}
