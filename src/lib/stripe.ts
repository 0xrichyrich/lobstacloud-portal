import Stripe from "stripe";

function getStripeKey(): string {
  const key = (process.env.STRIPE_SECRET_KEY || "").trim();
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return key;
}

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(getStripeKey(), {
      apiVersion: "2025-03-31.basil" as Stripe.LatestApiVersion,
    });
  }
  return _stripe;
}

export const PLAN_PRICES: Record<string, { name: string; price: number; priceId: string }> = {
  starter: {
    name: "Starter",
    price: 7,
    priceId: process.env.STRIPE_PRICE_STARTER || "",
  },
  pro: {
    name: "Pro",
    price: 24,
    priceId: process.env.STRIPE_PRICE_PRO || "",
  },
  business: {
    name: "Business",
    price: 48,
    priceId: process.env.STRIPE_PRICE_BUSINESS || "",
  },
};

// Look up Stripe customers by email
export async function getCustomerIdsByEmail(email: string): Promise<string[]> {
  const stripe = getStripe();
  const customers = await stripe.customers.list({
    email: email.toLowerCase(),
    limit: 10,
  });
  return customers.data.map((c) => c.id);
}

// Get subscription details for a customer
export async function getSubscriptionDetails(customerId: string) {
  const stripe = getStripe();
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 1,
    expand: ["data.default_payment_method"],
  });

  if (subs.data.length === 0) return null;

  const sub = subs.data[0] as Record<string, unknown> & Stripe.Subscription;
  const pm = sub.default_payment_method as Stripe.PaymentMethod | null;

  // current_period_end may be on the subscription or on items in newer Stripe API versions
  const periodEnd =
    (sub as Record<string, unknown>).current_period_end as number | undefined;
  const itemPeriodEnd = sub.items?.data?.[0]?.current_period_end as
    | number
    | undefined;

  return {
    id: sub.id,
    status: sub.status,
    currentPeriodEnd: periodEnd || itemPeriodEnd || 0,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    priceId: sub.items.data[0]?.price?.id || "",
    cardLast4: pm?.card?.last4 || null,
    cardBrand: pm?.card?.brand || null,
  };
}

// Get invoices for a customer
export async function getInvoices(customerId: string, limit = 12) {
  const stripe = getStripe();
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  });

  return invoices.data.map((inv) => ({
    id: inv.id,
    amount: (inv.amount_paid || 0) / 100,
    currency: inv.currency,
    status: inv.status,
    date: inv.created,
    pdfUrl: inv.invoice_pdf,
    hostedUrl: inv.hosted_invoice_url,
  }));
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  const stripe = getStripe();
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

// Resume a cancelled subscription
export async function resumeSubscription(subscriptionId: string) {
  const stripe = getStripe();
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}
