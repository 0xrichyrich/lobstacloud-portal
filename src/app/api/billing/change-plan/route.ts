import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { customerId, newPlan } = await req.json();

  // Verify the customer ID belongs to this user
  if (!session.customerIds.includes(customerId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Call the LobstaCloud API
  const res = await fetch("https://api.redlobsta.cloud/stripe/change-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId, newPlan }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.error || "Failed to change plan" },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}
