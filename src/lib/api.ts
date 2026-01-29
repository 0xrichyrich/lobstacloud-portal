const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lobstacloud-api.vercel.app';

export interface Gateway {
  id: string;
  subdomain: string;
  status: 'provisioning' | 'active' | 'error' | 'suspended';
  gateway_token: string;
  created_at: string;
  url: string;
}

export interface Channel {
  id: string;
  gateway_id: string;
  type: 'telegram' | 'discord' | 'slack' | 'whatsapp';
  config: Record<string, string>;
  enabled: boolean;
  created_at: string;
}

export interface CustomerData {
  customer: {
    id: string;
    email: string;
    name?: string;
    stripe_customer_id?: string;
  };
  gateways: Gateway[];
  channels: Channel[];
}

class ApiClient {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = API_URL;
  }
  
  private async fetch<T>(
    path: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `API error: ${res.status}`);
    }
    
    return res.json();
  }
  
  // Customer endpoints
  async getCustomerByEmail(email: string): Promise<CustomerData | null> {
    try {
      return await this.fetch<CustomerData>(`/api/customer?email=${encodeURIComponent(email)}`);
    } catch {
      return null;
    }
  }
  
  async getCustomerByStripeId(stripeCustomerId: string): Promise<CustomerData | null> {
    try {
      return await this.fetch<CustomerData>(`/api/customer?stripe_customer_id=${encodeURIComponent(stripeCustomerId)}`);
    } catch {
      return null;
    }
  }
  
  // Gateway endpoints
  async getGateways(customerId: string): Promise<Gateway[]> {
    const data = await this.fetch<{ gateways: Gateway[] }>(`/api/gateways?customer_id=${customerId}`);
    return data.gateways || [];
  }
  
  async getGateway(gatewayId: string): Promise<Gateway> {
    return this.fetch<Gateway>(`/api/gateways/${gatewayId}`);
  }
  
  // Channel endpoints  
  async getChannels(gatewayId: string): Promise<Channel[]> {
    const data = await this.fetch<{ channels: Channel[] }>(`/api/channels?gateway_id=${gatewayId}`);
    return data.channels || [];
  }
  
  async createChannel(gatewayId: string, type: string, config: Record<string, string>): Promise<Channel> {
    return this.fetch<Channel>('/api/channels', {
      method: 'POST',
      body: JSON.stringify({ gateway_id: gatewayId, type, config }),
    });
  }
  
  async updateChannel(channelId: string, config: Record<string, string>, enabled?: boolean): Promise<Channel> {
    return this.fetch<Channel>(`/api/channels/${channelId}`, {
      method: 'PATCH',
      body: JSON.stringify({ config, enabled }),
    });
  }
  
  async deleteChannel(channelId: string): Promise<void> {
    await this.fetch(`/api/channels/${channelId}`, { method: 'DELETE' });
  }
  
  // Stripe billing portal
  async createBillingPortalSession(stripeCustomerId: string, returnUrl: string): Promise<{ url: string }> {
    return this.fetch<{ url: string }>('/api/billing/portal', {
      method: 'POST',
      body: JSON.stringify({ stripe_customer_id: stripeCustomerId, return_url: returnUrl }),
    });
  }
}

export const api = new ApiClient();
