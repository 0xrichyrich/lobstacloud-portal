import { redirect } from "next/navigation";
import { verifyMagicToken, createSession } from "@/lib/auth";
import { getCustomerIdsByEmail } from "@/lib/stripe";

export default async function VerifyPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;

  if (!token) {
    redirect("/login?error=missing_token");
  }

  const result = await verifyMagicToken(token);

  if (!result) {
    redirect("/login?error=invalid_token");
  }

  // Look up stripe customer IDs for this email
  const customerIds = await getCustomerIdsByEmail(result.email);

  if (customerIds.length === 0) {
    redirect("/login?error=no_account");
  }

  // Create session
  await createSession(result.email, customerIds);

  redirect("/");
}
