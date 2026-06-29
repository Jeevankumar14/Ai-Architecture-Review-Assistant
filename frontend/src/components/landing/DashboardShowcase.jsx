import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Zap,
  TrendingUp,
  DollarSign,
  MessageSquare,
  FileText,
  Check,
  AlertTriangle,
  AlertCircle,
  Info,
} from 'lucide-react';

const tabs = [
  { id: 'architecture', label: 'Architecture Review', icon: FileText },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'performance', label: 'Performance', icon: Zap },
  { id: 'scalability', label: 'Scalability', icon: TrendingUp },
  { id: 'costs', label: 'Costs', icon: DollarSign },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
];

const statusConfig = {
  passed: {
    icon: Check,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  critical: {
    icon: AlertCircle,
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  info: {
    icon: Info,
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
  },
};

function FindingItem({ text, status }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${config.bg} ${config.border}`}
    >
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
          status === 'passed'
            ? 'bg-emerald-100'
            : status === 'critical'
            ? 'bg-red-100'
            : status === 'warning'
            ? 'bg-amber-100'
            : 'bg-sky-100'
        }`}
      >
        <Icon className={`w-4 h-4 ${config.text}`} />
      </div>
      <span className={`text-sm font-medium ${config.text}`}>{text}</span>
      <span
        className={`ml-auto text-xs font-semibold uppercase tracking-wide ${config.text} opacity-70`}
      >
        {status}
      </span>
    </div>
  );
}

function ScoreHeader({ score, label }) {
  const color =
    score >= 90
      ? 'text-emerald-600'
      : score >= 85
      ? 'text-blue-600'
      : 'text-amber-600';
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-baseline gap-3">
        <span className={`text-5xl font-bold tracking-tight ${color}`}>
          {score}
        </span>
        <span className="text-lg text-slate-400 font-medium">/100</span>
      </div>
      <span
        className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${
          score >= 90
            ? 'bg-emerald-50 text-emerald-700'
            : score >= 85
            ? 'bg-blue-50 text-blue-700'
            : 'bg-amber-50 text-amber-700'
        }`}
      >
        {label || (score >= 90 ? 'Excellent' : score >= 85 ? 'Good' : 'Fair')}
      </span>
    </div>
  );
}

function ArchitectureTab() {
  const scores = [
    { label: 'Security', value: 92, color: 'bg-emerald-500' },
    { label: 'Scalability', value: 91, color: 'bg-violet-500' },
    { label: 'Performance', value: 87, color: 'bg-amber-500' },
    { label: 'Maintainability', value: 88, color: 'bg-rose-500' },
    { label: 'Cost Optimization', value: 85, color: 'bg-cyan-500' },
    { label: 'Reliability', value: 90, color: 'bg-blue-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold tracking-tight text-blue-600">
              89
            </span>
            <span className="text-lg text-slate-400 font-medium">/100</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mt-2">
            Payment Gateway Architecture v2.1
          </h3>
        </div>
        <span className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Review Complete
        </span>
      </div>

      <p className="text-sm text-slate-500 leading-relaxed">
        23 rules evaluated, 3 critical issues, 5 warnings, 15 passed
      </p>

      <div className="space-y-3 pt-2">
        {scores.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 w-32 text-right shrink-0">
              {s.label}
            </span>
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${s.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${s.value}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-600 w-8">
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-5">
      <ScoreHeader score={92} />
      <div className="space-y-3">
        <FindingItem text="TLS 1.3 enforced on all endpoints" status="passed" />
        <FindingItem text="API key rotation policy defined" status="passed" />
        <FindingItem
          text="Missing rate limiting on payment endpoints"
          status="critical"
        />
        <FindingItem
          text="Input validation on user-facing APIs"
          status="warning"
        />
      </div>
    </div>
  );
}

function PerformanceTab() {
  return (
    <div className="space-y-5">
      <ScoreHeader score={87} />
      <div className="space-y-3">
        <FindingItem
          text="Database indexing strategy reviewed"
          status="passed"
        />
        <FindingItem text="CDN configuration optimized" status="passed" />
        <FindingItem
          text="N+1 query pattern detected in order service"
          status="warning"
        />
        <FindingItem
          text="Connection pooling not configured"
          status="critical"
        />
      </div>
    </div>
  );
}

function ScalabilityTab() {
  return (
    <div className="space-y-5">
      <ScoreHeader score={91} />
      <div className="space-y-3">
        <FindingItem
          text="Horizontal scaling strategy defined"
          status="passed"
        />
        <FindingItem
          text="Message queue for async processing"
          status="passed"
        />
        <FindingItem
          text="Auto-scaling policies configured"
          status="passed"
        />
        <FindingItem
          text="Single point of failure in auth service"
          status="warning"
        />
      </div>
    </div>
  );
}

function CostsTab() {
  return (
    <div className="space-y-5">
      <ScoreHeader score={85} />
      <div className="space-y-3">
        <FindingItem text="Right-sized compute instances" status="passed" />
        <FindingItem text="Storage tiering implemented" status="passed" />
        <FindingItem text="Unused resources identified" status="warning" />
        <FindingItem
          text="Reserved instance recommendations"
          status="info"
        />
      </div>
    </div>
  );
}

function ChatTab() {
  return (
    <div className="flex flex-col h-full min-h-[340px]">
      <div className="flex-1 space-y-4 pb-4">
        <div className="flex justify-end">
          <div className="max-w-[80%] bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-br-md text-sm leading-relaxed">
            What are the main security concerns in the payment gateway?
          </div>
        </div>
        <div className="flex justify-start">
          <div className="max-w-[85%] bg-slate-100 text-slate-700 px-4 py-3 rounded-2xl rounded-bl-md text-sm leading-relaxed">
            Based on my analysis, there are 3 key security concerns: 1) Missing
            rate limiting on /api/payments could allow DDoS attacks, 2) API keys
            are logged in plaintext in application logs, 3) No webhook signature
            verification for payment callbacks.
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 pt-4">
        <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
          <input
            type="text"
            readOnly
            placeholder="Ask about your architecture..."
            className="flex-1 bg-transparent text-sm text-slate-500 outline-none placeholder:text-slate-400"
          />
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

const tabComponents = {
  architecture: ArchitectureTab,
  security: SecurityTab,
  performance: PerformanceTab,
  scalability: ScalabilityTab,
  costs: CostsTab,
  chat: ChatTab,
};

const contentVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export default function DashboardShowcase() {
  const [activeTab, setActiveTab] = useState('architecture');
  const ActiveComponent = tabComponents[activeTab];

  return (
    <section className="py-24 sm:py-32 bg-[#FAFBFC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            See your architecture insights at a glance
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Every review generates a comprehensive dashboard with scores, risks,
            and actionable recommendations.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {/* Tab Bar */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 sm:p-8 lg:p-10 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <ActiveComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
