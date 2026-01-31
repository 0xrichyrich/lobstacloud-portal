import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  getSubscriptionDetails,
  getInvoices,
  PLAN_PRICES,
} from "@/lib/stripe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, FileText, Download } from "lucide-react";
import { BillingActions } from "./billing-actions";

export default async function BillingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const sql = getDb();

  // Get first gateway to determine customer_id and current plan
  const gateways = await sql`
    SELECT subdomain, plan, customer_id, subscription_id
    FROM gateways
    WHERE customer_id = ANY(${session.customerIds})
    AND status != 'deleted'
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (gateways.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Billing</h1>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No active subscription</h3>
            <p className="text-muted-foreground text-sm">
              Get started with a LobstaCloud server to view billing details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const gw = gateways[0];
  const customerId = gw.customer_id;

  // Fetch subscription details and invoices in parallel
  const [subDetails, invoices] = await Promise.all([
    getSubscriptionDetails(customerId),
    getInvoices(customerId),
  ]);

  const currentPlan = gw.plan;
  const planInfo = PLAN_PRICES[currentPlan] || {
    name: currentPlan,
    price: 0,
    priceId: "",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Billing & Subscription</h1>

      <div className="grid gap-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold">
                  {planInfo.name}{" "}
                  <span className="text-muted-foreground font-normal text-lg">
                    ${planInfo.price}/mo
                  </span>
                </h3>
                {subDetails && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {subDetails.cancelAtPeriodEnd ? (
                      <span className="text-yellow-400">
                        Cancels on{" "}
                        {new Date(
                          subDetails.currentPeriodEnd * 1000
                        ).toLocaleDateString()}
                      </span>
                    ) : (
                      <>
                        Next billing date:{" "}
                        {new Date(
                          subDetails.currentPeriodEnd * 1000
                        ).toLocaleDateString()}
                      </>
                    )}
                  </p>
                )}
              </div>
              {subDetails?.cancelAtPeriodEnd && (
                <Badge variant="warning">Cancelling</Badge>
              )}
            </div>

            {/* Plan comparison and actions */}
            <BillingActions
              customerId={customerId}
              currentPlan={currentPlan}
              subscriptionId={subDetails?.id || null}
              cancelAtPeriodEnd={subDetails?.cancelAtPeriodEnd || false}
              cardLast4={subDetails?.cardLast4 || null}
              cardBrand={subDetails?.cardBrand || null}
            />
          </CardContent>
        </Card>

        {/* Invoice History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">
                No invoices yet.
              </p>
            ) : (
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium">
                        ${inv.amount.toFixed(2)}{" "}
                        <span className="text-muted-foreground text-sm uppercase">
                          {inv.currency}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(inv.date * 1000).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          inv.status === "paid" ? "success" : "secondary"
                        }
                      >
                        {inv.status}
                      </Badge>
                      {inv.pdfUrl && (
                        <a
                          href={inv.pdfUrl}
                          target="_blank"
                          rel="noopener"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
