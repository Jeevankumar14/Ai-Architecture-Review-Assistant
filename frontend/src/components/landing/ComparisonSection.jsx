import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

const comparisons = [
  {
    dimension: 'Timeline',
    traditional: 'Days to weeks',
    ai: 'Minutes',
  },
  {
    dimension: 'Consistency',
    traditional: 'Varies by reviewer',
    ai: 'Standardized 200+ rules',
  },
  {
    dimension: 'Coverage',
    traditional: 'Limited to reviewer expertise',
    ai: '6 architecture dimensions',
  },
  {
    dimension: 'Cost',
    traditional: '$5,000+ per review',
    ai: 'Starting free',
  },
  {
    dimension: 'Knowledge Base',
    traditional: 'Individual experience',
    ai: 'AWS Well-Architected + OWASP + industry standards',
  },
  {
    dimension: 'Follow-up',
    traditional: 'Schedule another meeting',
    ai: 'Instant AI chat with full context',
  },
  {
    dimension: 'Documentation',
    traditional: 'Manual report writing',
    ai: 'Auto-generated comprehensive reports',
  },
  {
    dimension: 'Scalability',
    traditional: 'One review at a time',
    ai: 'Unlimited parallel reviews',
  },
];

const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.08,
      ease: 'easeOut',
    },
  }),
};

export default function ComparisonSection() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Why teams switch to AI-powered reviews
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Traditional architecture reviews are slow, expensive, and
            inconsistent. There is a better way.
          </p>
        </motion.div>

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-[1fr_1fr] sm:grid-cols-[140px_1fr_1fr] border-b border-slate-200">
            <div className="hidden sm:block p-4 bg-slate-50" />
            <div className="flex items-center gap-2.5 p-4 sm:p-5 bg-red-50/60 border-r border-slate-200">
              <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <X className="w-4 h-4 text-red-500" />
              </div>
              <span className="font-semibold text-sm text-red-800">
                Traditional Review
              </span>
            </div>
            <div className="flex items-center gap-2.5 p-4 sm:p-5 bg-blue-50/60">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-semibold text-sm text-blue-800">
                AI Architecture Review
              </span>
            </div>
          </div>

          {/* Data Rows */}
          {comparisons.map((row, i) => (
            <motion.div
              key={row.dimension}
              className={`grid grid-cols-[1fr_1fr] sm:grid-cols-[140px_1fr_1fr] ${
                i < comparisons.length - 1 ? 'border-b border-slate-100' : ''
              }`}
              variants={rowVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              custom={i}
            >
              {/* Dimension Label */}
              <div className="hidden sm:flex items-center p-4 sm:px-5 bg-slate-50/50">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {row.dimension}
                </span>
              </div>

              {/* Traditional Value */}
              <div className="flex items-center gap-3 p-4 sm:px-5 bg-red-50/30 border-r border-slate-100">
                <X className="w-4 h-4 text-red-400 shrink-0" />
                <div>
                  <span className="sm:hidden text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                    {row.dimension}
                  </span>
                  <span className="text-sm text-red-700/80">
                    {row.traditional}
                  </span>
                </div>
              </div>

              {/* AI Value */}
              <div className="flex items-center gap-3 p-4 sm:px-5 bg-blue-50/30">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <span className="sm:hidden text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                    {row.dimension}
                  </span>
                  <span className="text-sm text-slate-700 font-medium">
                    {row.ai}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
