import { Resend } from "resend";

function getResend(): Resend {
  const key = (process.env.RESEND_API_KEY || "").trim();
  if (!key) throw new Error("RESEND_API_KEY not set");
  return new Resend(key);
}

export async function sendMagicLinkEmail(email: string, token: string) {
  const resend = getResend();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://portal.redlobsta.com";
  const magicUrl = `${baseUrl}/auth/verify?token=${token}`;

  await resend.emails.send({
    from: "LobstaCloud <noreply@redlobsta.cloud>",
    to: email,
    subject: "Your LobstaCloud Login Link",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="max-width:480px;margin:0 auto;padding:40px 20px;">
          <div style="text-align:center;margin-bottom:32px;">
            <span style="font-size:48px;">🦞</span>
            <h1 style="color:#fff;font-size:24px;margin:12px 0 0;">LobstaCloud</h1>
          </div>
          <div style="background-color:#1a1a1a;border-radius:12px;padding:32px;border:1px solid rgba(255,255,255,0.1);">
            <p style="color:#ccc;font-size:16px;line-height:1.6;margin:0 0 24px;">
              Click the button below to sign in to your LobstaCloud dashboard. This link expires in 15 minutes.
            </p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${magicUrl}" style="display:inline-block;background-color:#dc2626;color:#fff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">
                Sign In to Dashboard
              </a>
            </div>
            <p style="color:#666;font-size:13px;line-height:1.5;margin:24px 0 0;">
              If you didn't request this link, you can safely ignore this email.<br><br>
              Or copy this URL: <a href="${magicUrl}" style="color:#dc2626;word-break:break-all;">${magicUrl}</a>
            </p>
          </div>
          <p style="color:#444;font-size:12px;text-align:center;margin-top:24px;">
            LobstaCloud — Managed OpenClaw Instances
          </p>
        </div>
      </body>
      </html>
    `,
  });
}
