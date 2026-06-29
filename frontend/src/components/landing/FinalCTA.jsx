import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function FinalCTA() {
  const { user } = useAuth();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/80 to-blue-50" />

      {/* Decorative blur circles */}
      <div className="absolute top-12 left-1/4 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-8 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-sky-100/40 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Ready to review your architecture?
          </h2>

          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            Start catching architecture issues before they reach production.
            Upload your first document and get a comprehensive review in
            minutes.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary button */}
            <Link
              to={user ? '/dashboard' : '/register'}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Upload Documents
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Secondary button */}
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <Calendar className="h-4 w-4" />
              Book a Demo
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
