import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLinkToken, createToken, setSessionCookie } from '@/lib/auth';
import { api } from '@/lib/api';
import { getTokenStore } from '@/lib/tokenStore';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
  }

  try {
    // M-1 fix: Check if token has already been used (one-time magic links)
    const tokenStore = getTokenStore();
    const isUsed = await tokenStore.isTokenUsed(token);
    
    if (isUsed) {
      console.warn('Magic link token already used');
      return NextResponse.redirect(new URL('/login?error=token_expired', request.url));
    }

    // Verify the magic link token
    const email = await verifyMagicLinkToken(token);

    if (!email) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }

    // M-1 fix: Mark token as used immediately (15 min TTL to match token expiry)
    await tokenStore.markTokenUsed(token, 15 * 60);

    // Look up the customer by email
    const customerData = await api.getCustomerByEmail(email);

    if (!customerData) {
      // Customer not found - they may not have a subscription yet
      // For now, create a basic session anyway so they can see the "no gateway" state
      const sessionToken = await createToken({
        id: email, // Use email as ID for now
        email,
      });

      await setSessionCookie(sessionToken);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Create session for existing customer
    const sessionToken = await createToken({
      id: customerData.customer.id,
      email: customerData.customer.email,
      name: customerData.customer.name,
      stripeCustomerId: customerData.customer.stripe_customer_id,
    });

    await setSessionCookie(sessionToken);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
  }
}
