'use client';

import { useState } from 'react';
import type { Gateway } from '@/lib/api';

interface GatewayCardProps {
  gateway: Gateway;
}

export default function GatewayCard({ gateway }: GatewayCardProps) {
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const gatewayUrl = `https://${gateway.subdomain}.redlobsta.cloud`;

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const getStatusBadge = () => {
    switch (gateway.status) {
      case 'active':
        return (
          <span className="status-active">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
            Active
          </span>
        );
      case 'provisioning':
        return (
          <span className="status-provisioning">
            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1.5 animate-pulse"></span>
            Provisioning
          </span>
        );
      case 'error':
        return (
          <span className="status-error">
            <span className="w-2 h-2 bg-red-400 rounded-full mr-1.5"></span>
            Error
          </span>
        );
      default:
        return (
          <span className="status-provisioning">
            {gateway.status}
          </span>
        );
    }
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            🦞 {gateway.subdomain}
            {getStatusBadge()}
          </h3>
          <p className="text-zinc-500 text-sm mt-1">
            Created {new Date(gateway.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Gateway URL */}
        <div>
          <label className="block text-sm font-medium text-zinc-500 mb-1">
            Gateway URL
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-zinc-950 px-3 py-2 rounded-lg text-red-600 font-mono text-sm border border-zinc-800 overflow-x-auto">
              {gatewayUrl}
            </code>
            <button
              onClick={() => copyToClipboard(gatewayUrl, 'url')}
              className="btn-secondary px-3 py-2 text-sm"
            >
              {copied === 'url' ? '✓' : '📋'}
            </button>
          </div>
        </div>

        {/* Gateway Token */}
        <div>
          <label className="block text-sm font-medium text-zinc-500 mb-1">
            Gateway Token
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-zinc-950 px-3 py-2 rounded-lg font-mono text-sm border border-zinc-800 overflow-x-auto">
              {showToken ? (
                <span className="text-white">{gateway.gateway_token}</span>
              ) : (
                <span className="text-zinc-600">••••••••••••••••••••</span>
              )}
            </code>
            <button
              onClick={() => setShowToken(!showToken)}
              className="btn-secondary px-3 py-2 text-sm"
            >
              {showToken ? '🙈' : '👁️'}
            </button>
            <button
              onClick={() => copyToClipboard(gateway.gateway_token, 'token')}
              className="btn-secondary px-3 py-2 text-sm"
            >
              {copied === 'token' ? '✓' : '📋'}
            </button>
          </div>
        </div>

        {/* Connection Details */}
        <div className="pt-4 border-t border-zinc-800">
          <h4 className="text-sm font-medium text-white mb-3">Quick Connect</h4>
          <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-2">Add to your .env file:</p>
            <code className="text-xs text-green-400 font-mono break-all">
              GATEWAY_URL={gatewayUrl}<br/>
              GATEWAY_TOKEN={showToken ? gateway.gateway_token : '••••••••'}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
