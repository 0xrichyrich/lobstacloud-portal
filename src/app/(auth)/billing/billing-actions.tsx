"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 7,
    specs: "1 vCPU · 2 GB RAM",
  },
  {
    id: "pro",
    name: "Pro",
    price: 24,
    specs: "2 vCPU · 4 GB RAM",
  },
  {
    id: "business",
    name: "Business",
    price: 48,
    specs: "4 vCPU · 8 GB RAM",
  },
];

export function BillingActions({
  customerId,
  currentPlan,
  subscriptionId,
  cancelAtPeriodEnd,
  cardLast4,
  cardBrand,
}: {
  customerId: string;
  currentPlan: string;
  subscriptionId: string | null;
  cancelAtPeriodEnd: boolean;
  cardLast4: string | null;
  cardBrand: string | null;
}) {
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [resuming, setResuming] = useState(false);

  async function handleChangePlan(newPlan: string) {
    if (newPlan === currentPlan) return;
    setChangingPlan(newPlan);
    setStatus("idle");
    setErrorMsg("");

    try {
      const res = await fetch("/api/billing/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, newPlan }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change plan");
      }

      setStatus("success");
      // Reload to show updated plan
      setTimeout(() => window.location.reload(), 1500);
    } catch (e: unknown) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Failed to change plan");
    } finally {
      setChangingPlan(null);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel");
      }

      window.location.reload();
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to cancel");
      setStatus("error");
    } finally {
      setCancelling(false);
      setShowCancelConfirm(false);
    }
  }

  async function handleResume() {
    setResuming(true);
    try {
      const res = await fetch("/api/billing/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to resume");
      }

      window.location.reload();
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to resume");
      setStatus("error");
    } finally {
      setResuming(false);
    }
  }

  async function handleUpdatePayment() {
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to open portal");
      }

      const { url } = await res.json();
      window.open(url, "_blank");
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to open portal");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      {/* Plan Selector */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-3">
          Change Plan
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            const isChanging = changingPlan === plan.id;

            return (
              <button
                key={plan.id}
                onClick={() => handleChangePlan(plan.id)}
                disabled={isCurrent || changingPlan !== null}
                className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-accent"
                } ${changingPlan !== null && !isChanging ? "opacity-50" : ""}`}
              >
                {isCurrent && (
                  <Badge className="absolute -top-2 right-3" variant="default">
                    Current
                  </Badge>
                )}
                <p className="font-semibold">{plan.name}</p>
                <p className="text-2xl font-bold mt-1">
                  ${plan.price}
                  <span className="text-sm text-muted-foreground font-normal">
                    /mo
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {plan.specs}
                </p>
                {isChanging && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Changing...
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Messages */}
      {status === "success" && (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <CheckCircle className="h-4 w-4" />
          Plan changed successfully! Reloading...
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {errorMsg}
        </div>
      )}

      {/* Payment Method */}
      <div className="flex items-center justify-between py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Payment Method</p>
            <p className="text-xs text-muted-foreground">
              {cardLast4
                ? `${(cardBrand || "Card").charAt(0).toUpperCase() + (cardBrand || "card").slice(1)} ending in ${cardLast4}`
                : "No payment method on file"}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleUpdatePayment}>
          Update
          <ArrowUpRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {/* Cancel / Resume */}
      <div className="border-t border-border pt-4">
        {cancelAtPeriodEnd ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Your subscription is set to cancel at the end of the billing
              period.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResume}
              disabled={resuming}
            >
              {resuming ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Resuming...
                </>
              ) : (
                "Resume Subscription"
              )}
            </Button>
          </div>
        ) : showCancelConfirm ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm font-medium text-destructive mb-3">
              Are you sure you want to cancel?
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Your server will remain active until the end of the billing
              period, then it will be permanently deleted.
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel Subscription"
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelConfirm(false)}
              >
                Keep Subscription
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setShowCancelConfirm(true)}
          >
            Cancel Subscription
          </Button>
        )}
      </div>
    </div>
  );
}
