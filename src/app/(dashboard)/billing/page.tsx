'use client';

import { useState } from 'react';

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenPortal = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to open billing portal');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Billing</h1>
        <p className="text-lobsta-gray-light mt-2">Manage your subscription and payment methods</p>
      </div>

      <div className="card max-w-2xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="text-4xl">💳</div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Stripe Customer Portal</h2>
            <p className="text-lobsta-gray-light">
              Manage your subscription, update payment methods, view invoices, and cancel your plan through the Stripe Customer Portal.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleOpenPortal}
          disabled={loading}
          className="btn-primary w-full sm:w-auto"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Opening...
            </span>
          ) : (
            'Open Billing Portal →'
          )}
        </button>

        <div className="mt-8 pt-6 border-t border-lobsta-black-lighter">
          <h3 className="text-sm font-medium text-white mb-4">What you can do in the portal:</h3>
          <ul className="space-y-2 text-sm text-lobsta-gray-light">
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Update payment method
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              View and download invoices
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Change or cancel subscription
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Update billing information
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
