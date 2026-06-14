'use client';

import { useActionState } from 'react';
import { authenticate } from './actions';
import Link from 'next/link';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(authenticate, null);

  return (
    <>
      {/* Mobile Blocker */}
      <div className="md:hidden flex h-[100dvh] items-center justify-center p-6 text-center bg-background text-foreground font-sans">
        <div className="space-y-4 max-w-sm">
          <h1 className="text-2xl font-bold uppercase text-red-500 tracking-widest border border-red-500/50 bg-red-500/10 p-4">
            Access Denied
          </h1>
          <p className="text-sm text-muted-text uppercase tracking-wider">
            Terminal requires desktop interface.<br/><br/>Mobile uplinks are prohibited.
          </p>
          <div className="pt-8">
            <Link href="/" className="text-xs text-muted-text hover:text-secondary uppercase tracking-wider transition-colors">
              ← Return to public grid
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden md:flex min-h-[100dvh] items-center justify-center bg-background p-4 font-sans text-foreground">
      <div className="w-full max-w-sm space-y-8">
        
        {/* Header section: Cyberpunk / Minimalist linear style */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-serif uppercase tracking-widest text-secondary">
            Terminal Access
          </h1>
          <p className="text-sm text-muted-text uppercase tracking-widest">
            Awaiting Operator Credentials
          </p>
        </div>

        {/* Login Form */}
        <form action={formAction} className="space-y-6">
          <div className="space-y-4">
            
            <div className="space-y-1">
              <label 
                htmlFor="username" 
                className="text-[11px] uppercase tracking-[0.18em] text-muted-text"
              >
                Identification
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-4 py-3 bg-card border border-border text-foreground focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all rounded-none"
                placeholder="system.admin"
              />
            </div>

            <div className="space-y-1">
              <label 
                htmlFor="password" 
                className="text-[11px] uppercase tracking-[0.18em] text-muted-text"
              >
                Passphrase
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-card border border-border text-foreground focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/50 transition-all rounded-none"
                placeholder="••••••••"
              />
            </div>

          </div>

          {state?.error && (
            <div className="p-3 bg-warning/10 border border-warning/50 text-warning text-sm text-center font-mono">
              [!] {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full btn-primary flex justify-center items-center gap-2"
          >
            {isPending ? 'Authenticating...' : 'Initialize Uplink'}
          </button>
          
        </form>

        <div className="text-center pt-8">
          <Link href="/" className="text-xs text-muted-text hover:text-secondary uppercase tracking-wider transition-colors">
            ← Return to public grid
          </Link>
        </div>

      </div>
    </>
  );
}
