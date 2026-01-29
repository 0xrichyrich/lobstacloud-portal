'use client';

import { useState } from 'react';
import type { Channel } from '@/lib/api';

interface ChannelFormProps {
  gatewayId: string;
  existingChannels: Channel[];
  onSave: (type: string, config: Record<string, string>) => Promise<void>;
  onDelete: (channelId: string) => Promise<void>;
}

const channelTypes = [
  {
    type: 'telegram',
    name: 'Telegram',
    icon: '📱',
    fields: [
      { key: 'bot_token', label: 'Bot Token', placeholder: '123456:ABC-DEF...', type: 'password' },
    ],
  },
  {
    type: 'discord',
    name: 'Discord',
    icon: '💬',
    fields: [
      { key: 'webhook_url', label: 'Webhook URL', placeholder: 'https://discord.com/api/webhooks/...', type: 'url' },
      { key: 'bot_token', label: 'Bot Token (optional)', placeholder: 'MTIz...', type: 'password' },
    ],
  },
  {
    type: 'slack',
    name: 'Slack',
    icon: '🔔',
    fields: [
      { key: 'webhook_url', label: 'Webhook URL', placeholder: 'https://hooks.slack.com/...', type: 'url' },
      { key: 'bot_token', label: 'Bot Token (optional)', placeholder: 'xoxb-...', type: 'password' },
    ],
  },
  {
    type: 'whatsapp',
    name: 'WhatsApp',
    icon: '📞',
    fields: [
      { key: 'phone_number_id', label: 'Phone Number ID', placeholder: '1234567890', type: 'text' },
      { key: 'access_token', label: 'Access Token', placeholder: 'EAAG...', type: 'password' },
    ],
  },
];

export default function ChannelForm({ gatewayId, existingChannels, onSave, onDelete }: ChannelFormProps) {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const getExistingChannel = (type: string) => existingChannels.find(c => c.type === type);

  const handleSave = async (type: string) => {
    setSaving(true);
    try {
      await onSave(type, formData);
      setActiveType(null);
      setFormData({});
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (channelId: string) => {
    setDeleting(channelId);
    try {
      await onDelete(channelId);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Channel Integrations</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channelTypes.map((channel) => {
          const existing = getExistingChannel(channel.type);
          const isActive = activeType === channel.type;
          
          return (
            <div
              key={channel.type}
              className={`card transition-all ${
                existing ? 'border-green-700' : 'border-zinc-800'
              } ${isActive ? 'ring-2 ring-red-600' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{channel.icon}</span>
                  <span className="font-semibold text-white">{channel.name}</span>
                </div>
                {existing && (
                  <span className="status-active">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
                    Connected
                  </span>
                )}
              </div>

              {isActive ? (
                <div className="space-y-3">
                  {channel.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm text-zinc-500 mb-1">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        className="input-field text-sm"
                        value={formData[field.key] || existing?.config[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      />
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleSave(channel.type)}
                      disabled={saving}
                      className="btn-primary text-sm flex-1"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setActiveType(null);
                        setFormData({});
                      }}
                      className="btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setActiveType(channel.type);
                      if (existing) {
                        setFormData(existing.config);
                      }
                    }}
                    className="btn-secondary text-sm flex-1"
                  >
                    {existing ? 'Edit' : 'Configure'}
                  </button>
                  {existing && (
                    <button
                      onClick={() => handleDelete(existing.id)}
                      disabled={deleting === existing.id}
                      className="px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      {deleting === existing.id ? '...' : '🗑️'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
