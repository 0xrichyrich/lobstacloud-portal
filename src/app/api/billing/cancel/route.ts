import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { cancelSubscription } from "@/lib/stripe";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subscriptionId } = await req.json();

  if (!subscriptionId) {
    return NextResponse.json(
      { error: "Missing subscription ID" },
      { status: 400 }
    );
  }

  // Verify subscription belongs to one of user's customer IDs
  const sql = getDb();
  const rows = await sql`
    SELECT id FROM gateways
    WHERE subscription_id = ${subscriptionId}
    AND customer_id = ANY(${session.customerIds})
    LIMIT 1
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await cancelSubscription(subscriptionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Cancel] Error:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
