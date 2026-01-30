export default function DocsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Documentation</h1>
        <p className="text-lobsta-gray-light mt-2">Get started with LobstaCloud</p>
      </div>

      <div className="prose prose-invert max-w-none">
        {/* Quick Start */}
        <section className="card mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            🚀 Quick Start
          </h2>
          <ol className="space-y-4 text-lobsta-gray-light">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-lobsta-red text-white text-sm flex items-center justify-center font-bold">1</span>
              <div>
                <strong className="text-white">Copy your Gateway URL and Token</strong>
                <p className="text-sm mt-1">Find these on your Dashboard. Keep your token secret!</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-lobsta-red text-white text-sm flex items-center justify-center font-bold">2</span>
              <div>
                <strong className="text-white">Configure your channels</strong>
                <p className="text-sm mt-1">Go to Settings and connect Telegram, Discord, or other platforms.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-lobsta-red text-white text-sm flex items-center justify-center font-bold">3</span>
              <div>
                <strong className="text-white">Set up OpenClaw</strong>
                <p className="text-sm mt-1">Add your credentials to OpenClaw&apos;s config file.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Configuration */}
        <section className="card mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            ⚙️ Configuration
          </h2>
          <p className="text-lobsta-gray-light mb-4">
            Add these to your OpenClaw configuration or environment variables:
          </p>
          <div className="bg-lobsta-black rounded-lg p-4 border border-lobsta-black-lighter overflow-x-auto">
            <pre className="text-sm">
              <code className="text-green-400">
{`# .env or config.yaml
GATEWAY_URL=https://your-subdomain.redlobsta.cloud
GATEWAY_TOKEN=your-gateway-token

# For Telegram
TELEGRAM_BOT_TOKEN=your-bot-token

# For Discord  
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...`}
              </code>
            </pre>
          </div>
        </section>

        {/* Channel Setup */}
        <section className="card mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            📱 Channel Setup
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                Telegram
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-lobsta-gray-light text-sm">
                <li>Message <a href="https://t.me/BotFather" className="text-lobsta-red hover:text-lobsta-red-light" target="_blank" rel="noopener">@BotFather</a> on Telegram</li>
                <li>Create a new bot with <code className="bg-lobsta-black-lighter px-1 rounded">/newbot</code></li>
                <li>Copy the bot token and add it in Settings</li>
                <li>Start a chat with your bot and send any message</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                Discord
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-lobsta-gray-light text-sm">
                <li>Go to your Discord server settings → Integrations → Webhooks</li>
                <li>Create a new webhook and copy the URL</li>
                <li>Add the webhook URL in Settings</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                Slack
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-lobsta-gray-light text-sm">
                <li>Go to <a href="https://api.slack.com/apps" className="text-lobsta-red hover:text-lobsta-red-light" target="_blank" rel="noopener">api.slack.com/apps</a></li>
                <li>Create a new app and enable Incoming Webhooks</li>
                <li>Create a webhook for your channel and copy the URL</li>
                <li>Add the webhook URL in Settings</li>
              </ol>
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section className="card mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            🔌 API Reference
          </h2>
          <p className="text-lobsta-gray-light mb-4">
            Your gateway exposes a WebSocket endpoint for real-time communication:
          </p>
          <div className="bg-lobsta-black rounded-lg p-4 border border-lobsta-black-lighter overflow-x-auto">
            <pre className="text-sm">
              <code className="text-green-400">
{`// Connect to your gateway
const ws = new WebSocket('wss://your-subdomain.redlobsta.cloud/ws');

// Authenticate
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your-gateway-token'
}));

// Send a message
ws.send(JSON.stringify({
  type: 'message',
  channel: 'telegram',
  content: 'Hello from LobstaCloud!'
}));`}
              </code>
            </pre>
          </div>
        </section>

        {/* Support */}
        <section className="card">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            💬 Need Help?
          </h2>
          <p className="text-lobsta-gray-light mb-4">
            We&apos;re here to help you get set up. Reach out through any of these channels:
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:support@redlobsta.cloud"
              className="btn-secondary inline-flex items-center gap-2"
            >
              ✉️ Email Support
            </a>
            <a
              href="https://discord.gg/lobstacloud"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center gap-2"
            >
              💬 Discord Community
            </a>
            <a
              href="https://github.com/lobstacloud"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center gap-2"
            >
              🐙 GitHub
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
