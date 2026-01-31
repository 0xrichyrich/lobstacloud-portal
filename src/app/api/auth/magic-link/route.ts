import { NextRequest, NextResponse } from "next/server";
import { createMagicLink } from "@/lib/auth";
import { sendMagicLinkEmail } from "@/lib/email";
import { getCustomerIdsByEmail } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // L-1 FIX: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify this email has at least one Stripe customer account
    const customerIds = await getCustomerIdsByEmail(normalizedEmail);
    if (customerIds.length === 0) {
      // Don't reveal whether email exists — still show success
      // but don't actually send email (prevents enumeration)
      return NextResponse.json({ success: true });
    }

    // Create magic link token
    const token = await createMagicLink(normalizedEmail);

    // Send email
    await sendMagicLinkEmail(normalizedEmail, token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Magic Link] Error:", error);
    return NextResponse.json(
      { error: "Failed to send login link" },
      { status: 500 }
    );
  }
}
