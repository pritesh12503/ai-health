import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div className="animate-fade-up">
        <p className="font-mono text-teal-400 text-6xl font-bold mb-4">404</p>
        <h1 className="font-display text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-slate-400 text-sm mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
      </div>
    </div>
  )
}
