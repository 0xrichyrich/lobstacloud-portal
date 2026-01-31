import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Server, ExternalLink, Plus } from "lucide-react";
import Link from "next/link";

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
    case "deleted":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getPlanLabel(plan: string) {
  const map: Record<string, string> = {
    starter: "Starter",
    pro: "Pro",
    business: "Business",
  };
  return map[plan] || plan;
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const sql = getDb();

  // Get gateways for all customer IDs
  const customerIds = session.customerIds;
  const gateways = await sql`
    SELECT subdomain, plan, status, status_message, ipv4, created_at, updated_at
    FROM gateways
    WHERE customer_id = ANY(${customerIds})
    AND status != 'deleted'
    ORDER BY created_at DESC
  `;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session.email}
          </p>
        </div>
      </div>

      {gateways.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Server className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No servers yet</h3>
            <p className="text-muted-foreground text-sm text-center mb-6 max-w-md">
              Get your own managed OpenClaw instance in minutes. Choose a plan
              and we&apos;ll handle all the infrastructure.
            </p>
            <Button asChild>
              <a href="https://redlobsta.cloud">
                <Plus className="h-4 w-4" />
                Get Started
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {gateways.map((gw: Record<string, string>) => (
            <Card key={gw.subdomain} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Server className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {gw.subdomain}.redlobsta.cloud
                        </h3>
                        <Badge variant={getStatusVariant(gw.status)}>
                          {formatStatus(gw.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{getPlanLabel(gw.plan)} Plan</span>
                        {gw.ipv4 && <span>IP: {gw.ipv4}</span>}
                        <span>
                          Created{" "}
                          {new Date(gw.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {gw.status === "active" && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={`https://${gw.subdomain}.redlobsta.cloud`}
                          target="_blank"
                          rel="noopener"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/servers/${gw.subdomain}`}>Manage</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
