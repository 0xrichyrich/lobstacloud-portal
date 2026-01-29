'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send magic link');
      }

      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🦞</div>
          <h1 className="text-3xl font-bold text-white">
            Lobsta<span className="text-lobsta-red">Cloud</span>
          </h1>
          <p className="text-lobsta-gray-light mt-2">Customer Portal</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
              {error === 'invalid_token' && 'Invalid or expired link. Please request a new one.'}
              {error === 'no_customer' && 'No account found for this email. Contact support.'}
              {error !== 'invalid_token' && error !== 'no_customer' && error}
            </div>
          )}

          {status === 'sent' ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✉️</div>
              <h2 className="text-xl font-semibold text-white mb-2">Check your email!</h2>
              <p className="text-lobsta-gray-light">
                We sent a magic link to <span className="text-white">{email}</span>
              </p>
              <p className="text-sm text-lobsta-gray mt-4">
                The link expires in 15 minutes.
              </p>
              <button
                onClick={() => {
                  setStatus('idle');
                  setEmail('');
                }}
                className="mt-6 text-lobsta-red hover:text-lobsta-red-light transition-colors text-sm"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-lobsta-gray-light mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field"
                    required
                    disabled={status === 'sending'}
                  />
                </div>

                {status === 'error' && (
                  <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending' || !email}
                  className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Magic Link'
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-lobsta-gray-light">
                Don&apos;t have an account?{' '}
                <a
                  href="https://redlobsta.com"
                  className="text-lobsta-red hover:text-lobsta-red-light transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get started
                </a>
              </p>
            </>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-lobsta-gray">
          Powered by{' '}
          <a
            href="https://redlobsta.cloud"
            className="text-lobsta-red hover:text-lobsta-red-light transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            redlobsta.cloud
          </a>
        </p>
      </div>
    </div>
  );
}
