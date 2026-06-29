import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, Shield, Zap, TrendingUp, DollarSign, Wrench, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const floatAnimation = {
  y: [-6, 6, -6],
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

const scoreCategories = [
  { label: 'Security', score: 92, color: '#10B981', icon: Shield },
  { label: 'Performance', score: 87, color: '#F59E0B', icon: Zap },
  { label: 'Scalability', score: 91, color: '#6366F1', icon: TrendingUp },
  { label: 'Cost', score: 85, color: '#0EA5E9', icon: DollarSign },
  { label: 'Maintainability', score: 88, color: '#8B5CF6', icon: Wrench },
];

const recentReviews = [
  { name: 'Payment Gateway HLD', score: 88 },
  { name: 'User Auth Service', score: 94 },
];

function CircularProgress({ score, size = 100, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-bold text-slate-900"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
          / 100
        </span>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-[#FAFBFC] pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute top-1/2 -left-24 h-72 w-72 rounded-full bg-indigo-100/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left side content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            {/* Badge */}
            <motion.div variants={slideInLeft} className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
                <Sparkles className="h-4 w-4" />
                AI-Powered Architecture Intelligence
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={slideInLeft}
              className="text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl"
            >
              Review Software Architecture
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Before It Becomes
              </span>{' '}
              Technical Debt
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={slideInLeft}
              className="mt-6 text-lg leading-relaxed text-slate-600"
            >
              Upload your SRS, HLD, or API specs and get a comprehensive architecture review in
              minutes. AI-powered analysis across security, performance, scalability, cost, and
              maintainability.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={slideInLeft} className="mt-8 flex flex-wrap items-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30"
                >
                  Start Free Review
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              )}
              <button className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md">
                <Play className="h-4 w-4 text-blue-600" />
                Watch Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Right side dashboard mockup */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            className="relative flex justify-center lg:justify-end"
          >
            {/* Blur glow behind card */}
            <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-400/20 via-indigo-400/15 to-purple-400/10 blur-3xl" />

            <motion.div
              animate={floatAnimation}
              className="relative w-full max-w-md"
            >
              <div className="rounded-2xl border border-slate-200/60 bg-white shadow-2xl">
                {/* Window bar */}
                <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="ml-3 text-xs font-medium text-slate-400">
                    Architecture Review
                  </span>
                </div>

                {/* Card body */}
                <div className="p-5">
                  {/* Architecture Score */}
                  <div className="mb-5 flex items-center gap-5">
                    <CircularProgress score={89} size={90} strokeWidth={7} />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Architecture Score
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">89 / 100</p>
                      <p className="mt-0.5 text-xs text-green-600 font-medium">Good - Minor improvements suggested</p>
                    </div>
                  </div>

                  {/* Score pills */}
                  <div className="mb-5 flex flex-wrap gap-2">
                    {scoreCategories.map((cat) => (
                      <div
                        key={cat.label}
                        className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5"
                      >
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-[11px] font-medium text-slate-600">
                          {cat.label}
                        </span>
                        <span className="text-[11px] font-bold text-slate-800">{cat.score}</span>
                      </div>
                    ))}
                  </div>

                  {/* Recent Reviews */}
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Recent Reviews
                    </p>
                    <div className="space-y-2">
                      {recentReviews.map((review) => (
                        <div
                          key={review.name}
                          className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3 py-2.5"
                        >
                          <span className="text-xs font-medium text-slate-700">{review.name}</span>
                          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                            {review.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk card */}
                  <div className="rounded-xl border border-red-100 bg-red-50/50 px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-500" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                          Critical
                        </span>
                        <p className="mt-0.5 text-xs leading-snug text-red-700">
                          Missing rate limiting on /api/payments endpoint
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
