import { Link } from 'react-router-dom'
import { Activity, ShieldCheck, Zap, BookOpen, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: <Activity className="w-5 h-5 text-teal-400" />,
    title: 'AI Symptom Triage',
    desc: 'Describe your symptoms in plain language. Our AI analyzes risk level, suggests possible conditions, and recommends next steps.'
  },
  {
    icon: <BookOpen className="w-5 h-5 text-teal-400" />,
    title: 'Prescription Explainer',
    desc: 'Paste your prescription and get it explained in simple terms — dosage, purpose, side effects, and warnings.'
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-teal-400" />,
    title: 'Safety First',
    desc: 'Emergency indicators are always detected and escalated. Every response includes a medical disclaimer.'
  },
  {
    icon: <Zap className="w-5 h-5 text-teal-400" />,
    title: 'RAG-Powered Accuracy',
    desc: 'Responses are grounded in verified medical knowledge, not hallucinated — using Retrieval-Augmented Generation.'
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/25 rounded-full px-4 py-1.5 text-sm text-teal-400 mb-8 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse-slow" />
          AI-Powered Health Guidance
        </div>

        <h1 className="animate-fade-up stagger-1 text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight text-white mb-6">
          Understand your health<br />
          <span className="text-teal-400 italic">before the appointment</span>
        </h1>

        <p className="animate-fade-up stagger-2 text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          MediAI helps you make sense of symptoms and prescriptions using verified medical knowledge and responsible AI — not a replacement for doctors, but a smarter way to prepare.
        </p>

        <div className="animate-fade-up stagger-3 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/signup" className="btn-primary flex items-center gap-2 text-base">
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="btn-secondary text-base">
            Sign In
          </Link>
        </div>

        {/* Disclaimer */}
        <p className="animate-fade-up stagger-4 mt-8 text-xs text-slate-600 max-w-lg mx-auto">
          ⚠️ For educational purposes only. Always consult a qualified healthcare professional for medical decisions.
        </p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="card p-6 hover:border-teal-500/30 transition-colors duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-4 group-hover:bg-teal-500/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="font-display font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
