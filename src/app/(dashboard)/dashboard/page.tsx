import { getSession } from '@/lib/auth';
import { api } from '@/lib/api';
import GatewayCard from '@/components/GatewayCard';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    return null;
  }

  const customerData = await api.getCustomerByEmail(session.user.email);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-lobsta-gray-light mt-2">
          Manage your LobstaCloud gateways
        </p>
      </div>

      {!customerData || customerData.gateways.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🦞</div>
          <h2 className="text-xl font-semibold text-white mb-2">No gateways yet</h2>
          <p className="text-lobsta-gray-light mb-6">
            Your gateway is being provisioned, or you haven&apos;t subscribed yet.
          </p>
          <a
            href="https://redlobsta.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-block"
          >
            Get Started
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {customerData.gateways.map((gateway) => (
            <GatewayCard key={gateway.id} gateway={gateway} />
          ))}

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Link href="/settings" className="card hover:border-lobsta-red transition-colors group">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚙️</span>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-lobsta-red transition-colors">
                    Configure Channels
                  </h3>
                  <p className="text-sm text-lobsta-gray-light">
                    Connect Telegram, Discord, etc.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/billing" className="card hover:border-lobsta-red transition-colors group">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💳</span>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-lobsta-red transition-colors">
                    Billing
                  </h3>
                  <p className="text-sm text-lobsta-gray-light">
                    Manage subscription
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/docs" className="card hover:border-lobsta-red transition-colors group">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📚</span>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-lobsta-red transition-colors">
                    Documentation
                  </h3>
                  <p className="text-sm text-lobsta-gray-light">
                    Quick start guide
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
