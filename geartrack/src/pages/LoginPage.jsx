import { Package } from 'lucide-react'
import Footer from '../components/Footer'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-surface rounded-base shadow-md w-full max-w-sm p-8 flex flex-col gap-6">

          <div className="flex flex-col items-center gap-2">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Package size={36} className="text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-primary">GearTrack</h1>
            <p className="font-body text-text-muted text-sm text-center">
              Sign in to your business workspace
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-sm font-semibold text-text" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                className="border border-border rounded-base px-4 py-2.5 text-sm font-body text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-sm font-semibold text-text" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="border border-border rounded-base px-4 py-2.5 text-sm font-body text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary transition"
              />
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white rounded-base py-2.5 font-heading font-semibold text-sm transition-colors mt-1"
            >
              Sign In
            </button>
          </form>

          <p className="font-body text-xs text-text-muted text-center">
            Don&apos;t have a workspace?{' '}
            <a href="#" className="text-secondary hover:underline font-semibold">
              Contact sales
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
