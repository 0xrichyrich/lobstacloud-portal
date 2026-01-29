'use client';

import { useEffect, useState } from 'react';
import ChannelForm from '@/components/ChannelForm';
import type { Gateway, Channel } from '@/lib/api';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/customer');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setGateways(data.gateways || []);
      setChannels(data.channels || []);
      if (data.gateways?.length > 0) {
        setSelectedGateway(data.gateways[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChannel = async (type: string, config: Record<string, string>) => {
    if (!selectedGateway) return;
    
    try {
      const existing = channels.find(c => c.gateway_id === selectedGateway && c.type === type);
      
      const res = await fetch('/api/channels', {
        method: existing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: existing?.id,
          gateway_id: selectedGateway,
          type,
          config,
        }),
      });

      if (!res.ok) throw new Error('Failed to save channel');
      
      setMessage({ type: 'success', text: `${type} channel saved successfully!` });
      await fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to save ${type} channel` });
      throw error;
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    try {
      const res = await fetch(`/api/channels?id=${channelId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete channel');
      
      setMessage({ type: 'success', text: 'Channel deleted successfully!' });
      await fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete channel' });
      throw error;
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin text-4xl">🦞</div>
      </div>
    );
  }

  if (gateways.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-lobsta-gray-light mt-2">Configure your gateway channels</p>
        </div>
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">⚙️</div>
          <h2 className="text-xl font-semibold text-white mb-2">No gateway available</h2>
          <p className="text-lobsta-gray-light">
            You need an active gateway to configure channels.
          </p>
        </div>
      </div>
    );
  }

  const gatewayChannels = channels.filter(c => c.gateway_id === selectedGateway);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-lobsta-gray-light mt-2">Configure your gateway channels</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-900/30 border-green-700 text-green-400'
              : 'bg-red-900/30 border-red-700 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {gateways.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-lobsta-gray-light mb-2">
            Select Gateway
          </label>
          <select
            value={selectedGateway || ''}
            onChange={(e) => setSelectedGateway(e.target.value)}
            className="input-field max-w-xs"
          >
            {gateways.map((gw) => (
              <option key={gw.id} value={gw.id}>
                {gw.subdomain}.redlobsta.cloud
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="card">
        <ChannelForm
          gatewayId={selectedGateway || ''}
          existingChannels={gatewayChannels}
          onSave={handleSaveChannel}
          onDelete={handleDeleteChannel}
        />
      </div>
    </div>
  );
}
