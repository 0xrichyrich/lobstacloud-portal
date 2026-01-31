"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface StatusData {
  status: string;
  statusMessage: string | null;
}

export function ServerStatusPoller({ subdomain }: { subdomain: string }) {
  const [data, setData] = useState<StatusData | null>(null);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const res = await fetch(
          `https://api.redlobsta.cloud/gateways/status/${subdomain}`
        );
        if (res.ok) {
          const json = await res.json();
          if (active) setData(json);

          // Stop polling if active or failed
          if (json.status === "active" || json.status === "failed") {
            // Reload page to show full active UI
            if (json.status === "active") {
              window.location.reload();
            }
            return;
          }
        }
      } catch {
        // ignore
      }

      if (active) {
        setTimeout(poll, 5000);
      }
    }

    poll();
    return () => {
      active = false;
    };
  }, [subdomain]);

  if (!data) return null;

  const isProvisioning = [
    "provisioning",
    "creating_server",
    "configuring_dns",
    "installing",
  ].includes(data.status);
  const isFailed = data.status === "failed" || data.status === "error";

  return (
    <Card className="mb-6 border-yellow-600/30 bg-yellow-600/5">
      <CardContent className="flex items-center gap-3 p-4">
        {isProvisioning && (
          <>
            <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
            <div>
              <p className="font-medium text-yellow-400">
                Server is being set up...
              </p>
              <p className="text-sm text-muted-foreground">
                {data.statusMessage || "This usually takes 2-5 minutes. This page will refresh automatically."}
              </p>
            </div>
          </>
        )}
        {isFailed && (
          <>
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-400">Provisioning failed</p>
              <p className="text-sm text-muted-foreground">
                {data.statusMessage || "Please contact support."}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
