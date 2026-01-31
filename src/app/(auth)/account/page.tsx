"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, LogOut, ExternalLink, Loader2 } from "lucide-react";

export default function AccountPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    // Get email from session via API
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => setEmail(data.email))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Account Settings</h1>

      <div className="grid gap-6 max-w-2xl">
        {/* Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4" />
              Email Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-mono">
              {email || "Loading..."}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Your email is your identity on LobstaCloud. It cannot be changed.
            </p>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Need help? Reach out to our support team.
            </p>
            <Button variant="outline" asChild>
              <a href="mailto:support@redlobsta.cloud">
                Contact Support
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
