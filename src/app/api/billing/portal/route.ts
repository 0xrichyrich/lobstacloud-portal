import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// C-1 FIX: API requires Bearer token auth
const PROVISION_SECRET = process.env.PROVISION_SECRET || "";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { customerId } = await req.json();

  // M-2 FIX: Verify the customer ID belongs to this user
  if (!customerId || !session.customerIds.includes(customerId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // C-1 FIX: Call the LobstaCloud API with Bearer token
  const res = await fetch("https://api.redlobsta.cloud/stripe/portal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${PROVISION_SECRET}`,
    },
    body: JSON.stringify({ customerId }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.error || "Failed to create portal session" },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}
