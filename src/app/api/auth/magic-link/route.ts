import { NextRequest, NextResponse } from 'next/server';
import { createMagicLinkToken } from '@/lib/auth';
import { getTokenStore } from '@/lib/tokenStore';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // L-5 fix: Rate limit magic link requests (max 3 per hour per email)
    const tokenStore = getTokenStore();
    const normalizedEmail = email.toLowerCase().trim();
    const { allowed, remaining } = await tokenStore.checkRateLimit(
      `magic:${normalizedEmail}`,
      3,  // max 3 requests
      60 * 60  // per hour (3600 seconds)
    );

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many magic link requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Create magic link token
    const token = await createMagicLinkToken(email);
    
    // Build the magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const magicLink = `${baseUrl}/api/auth/verify?token=${token}`;

    // In production, send email via your email service
    // For now, we'll use console.log and optionally the API
    console.log(`Magic link for ${email}: ${magicLink}`);

    // If email service is configured, send the email
    if (process.env.RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'LobstaCloud <noreply@redlobsta.cloud>',
            to: email,
            subject: 'Sign in to LobstaCloud',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #DC2626;">🦞 LobstaCloud</h1>
                <p>Click the link below to sign in to your LobstaCloud portal:</p>
                <p style="margin: 30px 0;">
                  <a href="${magicLink}" 
                     style="background-color: #DC2626; color: white; padding: 12px 24px; 
                            text-decoration: none; border-radius: 8px; display: inline-block;">
                    Sign In to LobstaCloud
                  </a>
                </p>
                <p style="color: #666; font-size: 14px;">
                  This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="color: #999; font-size: 12px;">
                  LobstaCloud - Your AI Gateway
                </p>
              </div>
            `,
          }),
        });

        if (!res.ok) {
          console.error('Failed to send email:', await res.text());
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }
    }

    // In development, also return the link for testing
    const isDev = process.env.NODE_ENV === 'development';
    
    return NextResponse.json({
      success: true,
      message: 'Magic link sent to your email',
      ...(isDev && { devLink: magicLink }),
    });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    );
  }
}
