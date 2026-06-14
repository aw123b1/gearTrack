import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Loader } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Footer from '../components/Footer'

export default function LoginPage() {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) throw signUpError
        setError('Sign up successful! You can now sign in.')
        setEmail('')
        setPassword('')
        setIsSignUp(false)
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

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
              {isSignUp ? 'Create your account' : 'Sign in to your workspace'}
            </p>
          </div>

          {error && (
            <div className={`p-3 rounded-base text-sm font-body ${
              error.includes('successful')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {error}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleAuth}>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-sm font-semibold text-text" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="border border-border rounded-base px-4 py-2.5 text-sm font-body text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary transition disabled:opacity-50"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="border border-border rounded-base px-4 py-2.5 text-sm font-body text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary transition disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-base py-2.5 font-heading font-semibold text-sm transition-colors mt-1"
            >
              {loading && <Loader size={16} className="animate-spin" />}
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="flex flex-col gap-2 items-center">
            <p className="font-body text-xs text-text-muted text-center">
              {isSignUp
                ? 'Already have an account? '
                : 'Don\'t have an account? '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                }}
                className="text-secondary hover:underline font-semibold"
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
