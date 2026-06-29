import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { FileSearch, ShieldAlert, Award, BookOpen, Image, MessageCircle, Sparkles } from 'lucide-react';
import { MouseEvent } from 'react';

const GlowCard = ({ children, className = "" }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative rounded-3xl border border-white/10 bg-slate-900 overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(59, 130, 246, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full flex flex-col p-8 z-10">
        {children}
      </div>
    </div>
  );
};

export default function FeatureGrid() {
  return (
    <section className="py-32 bg-slate-950 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 translate-y-1/3" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium mb-6 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Intelligence</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold tracking-tighter text-white leading-[1.1] mb-6"
          >
            Everything you need for <br />architecture excellence.
          </motion.h2>
        </div>

        {/* Masonry / Bento Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          
          {/* 1. Full-Context Review (Span 2 cols) */}
          <GlowCard className="md:col-span-2 md:row-span-1">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden opacity-20 group-hover:opacity-60 transition-opacity duration-700">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f633_1px,transparent_1px),linear-gradient(to_bottom,#3b82f633_1px,transparent_1px)] bg-[size:1rem_1rem]" />
              <motion.div 
                className="absolute left-0 right-0 h-1 bg-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,1)]"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <FileSearch className="w-10 h-10 text-blue-400 mb-auto" />
            <div className="mt-8 relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Full-Context Review</h3>
              <p className="text-slate-400 leading-relaxed max-w-sm">
                Our engine ingests your SRS, HLD, and APIs simultaneously, cross-referencing every architectural decision.
              </p>
            </div>
          </GlowCard>

          {/* 2. Zero-Day Risks */}
          <GlowCard className="md:col-span-1 md:row-span-1 group/risk">
            <ShieldAlert className="w-10 h-10 text-slate-500 mb-auto transition-colors duration-500 group-hover/risk:text-rose-500" />
            
            <div className="absolute right-8 top-8 opacity-0 group-hover/risk:opacity-100 transition-opacity duration-500">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
              </motion.div>
            </div>

            <div className="mt-8 relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Zero-Day Risks</h3>
              <p className="text-slate-400 leading-relaxed">
                Identify critical vulnerabilities and bottlenecks before writing code.
              </p>
            </div>
          </GlowCard>

          {/* 3. Dimensional Scoring (Tall) */}
          <GlowCard className="md:col-span-1 md:row-span-2 text-center items-center justify-center">
            <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <motion.circle 
                  cx="80" cy="80" r="70" fill="none" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round"
                  initial={{ strokeDasharray: 440, strokeDashoffset: 440 }}
                  whileInView={{ strokeDashoffset: 440 - (440 * 0.94) }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-white tracking-tighter">94</span>
                <span className="text-xs text-blue-400 font-bold uppercase tracking-widest mt-1">Score</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Dimensional Scoring</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Strict quantitative health index across 6 dimensions.
            </p>
          </GlowCard>

          {/* 4. RAG Knowledge */}
          <GlowCard className="md:col-span-1 md:row-span-1">
            <BookOpen className="w-10 h-10 text-emerald-400 mb-auto" />
            <div className="mt-8 relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">RAG Knowledge Base</h3>
              <p className="text-slate-400 leading-relaxed">
                Grounded strictly in AWS Well-Architected Framework and OWASP.
              </p>
            </div>
          </GlowCard>

          {/* 5. Diagram OCR */}
          <GlowCard className="md:col-span-1 md:row-span-1 group/ocr">
            <Image className="w-10 h-10 text-amber-400 mb-auto" />
            <div className="absolute right-8 top-8 opacity-20 group-hover/ocr:opacity-100 transition-opacity">
               <div className="w-12 h-8 border-2 border-dashed border-amber-400/50 rounded flex items-center justify-center">
                 <div className="w-6 h-1 bg-amber-400/50 rounded-full" />
               </div>
            </div>
            <div className="mt-8 relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Diagram OCR</h3>
              <p className="text-slate-400 leading-relaxed">
                Upload architecture flowcharts. Models extract relationships automatically.
              </p>
            </div>
          </GlowCard>

          {/* 6. Context Chat (Span 2 cols) */}
          <GlowCard className="md:col-span-2 md:row-span-1">
            <div className="absolute right-8 top-1/2 -translate-y-1/2 w-1/3 hidden md:flex flex-col gap-3 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl rounded-tr-sm p-3 self-end shadow-lg backdrop-blur-sm">
                <div className="w-20 h-1.5 bg-blue-400/50 rounded-full" />
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl rounded-tl-sm p-3 self-start shadow-lg backdrop-blur-sm">
                <div className="w-24 h-1.5 bg-slate-400/50 rounded-full mb-2" />
                <div className="w-16 h-1.5 bg-slate-400/50 rounded-full" />
              </div>
            </div>
            
            <MessageCircle className="w-10 h-10 text-fuchsia-400 mb-auto" />
            <div className="mt-8 relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Context-Aware AI Chat</h3>
              <p className="text-slate-400 leading-relaxed max-w-sm">
                Drop into an interactive chat session with full context of your architecture to evaluate alternative trade-offs.
              </p>
            </div>
          </GlowCard>

        </div>
      </div>
    </section>
  );
}
