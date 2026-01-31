import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Server,
  ExternalLink,
  ArrowLeft,
  Cpu,
  Clock,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { ServerStatusPoller } from "./status-poller";

function getStatusVariant(status: string) {
  switch (status) {
    case "active":
      return "success" as const;
    case "provisioning":
    case "creating_server":
    case "configuring_dns":
    case "installing":
      return "warning" as const;
    case "failed":
    case "error":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getPlanDetails(plan: string) {
  const plans: Record<string, { name: string; price: number; specs: string }> = {
    starter: { name: "Starter", price: 7, specs: "1 vCPU, 2 GB RAM" },
    pro: { name: "Pro", price: 24, specs: "2 vCPU, 4 GB RAM" },
    business: { name: "Business", price: 48, specs: "4 vCPU, 8 GB RAM" },
  };
  return plans[plan] || { name: plan, price: 0, specs: "Unknown" };
}

export default async function ServerDetailPage(props: {
  params: Promise<{ subdomain: string }>;
}) {
  const params = await props.params;
  const session = await getSession();
  if (!session) redirect("/login");

  const sql = getDb();
  const gateways = await sql`
    SELECT subdomain, plan, status, status_message, ipv4, created_at, updated_at
    FROM gateways
    WHERE subdomain = ${params.subdomain}
    AND customer_id = ANY(${session.customerIds})
    AND status != 'deleted'
    LIMIT 1
  `;

  if (gateways.length === 0) {
    notFound();
  }

  const gw = gateways[0];
  const planDetails = getPlanDetails(gw.plan);
  const domain = `${gw.subdomain}.redlobsta.cloud`;

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{domain}</h1>
            <Badge variant={getStatusVariant(gw.status)}>
              {formatStatus(gw.status)}
            </Badge>
          </div>
          {gw.status_message && (
            <p className="text-sm text-muted-foreground mt-1">
              {gw.status_message}
            </p>
          )}
        </div>
        {gw.status === "active" && (
          <Button asChild>
            <a href={`https://${domain}`} target="_blank" rel="noopener">
              <ExternalLink className="h-4 w-4" />
              Open Gateway
            </a>
          </Button>
        )}
      </div>

      {/* Live status polling for non-active states */}
      {gw.status !== "active" && (
        <ServerStatusPoller subdomain={gw.subdomain} />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Server Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-4 w-4" />
              Server Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Domain</span>
              <a
                href={`https://${domain}`}
                target="_blank"
                rel="noopener"
                className="text-primary hover:underline flex items-center gap-1"
              >
                {domain}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            {gw.ipv4 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">IP Address</span>
                <span className="font-mono text-sm">{gw.ipv4}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={getStatusVariant(gw.status)}>
                {formatStatus(gw.status)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Plan Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Cpu className="h-4 w-4" />
              Plan & Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-semibold">{planDetails.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Specs</span>
              <span className="text-sm">{planDetails.specs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span>${planDetails.price}/mo</span>
            </div>
            <div className="pt-2">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/billing">Manage Plan</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>
                {new Date(gw.created_at).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span>
                {new Date(gw.updated_at).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {gw.status === "active" && (
                <Button variant="outline" size="sm" disabled>
                  🔄 Restart Server (Coming Soon)
                </Button>
              )}
              {gw.status === "active" && (
                <Button variant="outline" size="sm" disabled>
                  📋 View Logs (Coming Soon)
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <a href="mailto:support@redlobsta.cloud">
                  💬 Contact Support
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
