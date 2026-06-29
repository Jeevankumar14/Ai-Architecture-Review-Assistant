import { motion } from 'framer-motion';
import { Upload, Brain, Search, Settings, Sparkles, FileText, MessageSquare } from 'lucide-react';

const steps = [
  {
    num: "01",
    title: "Upload Documents",
    desc: "Ingest SRS, HLD, API specs, or raw architecture diagrams into the secure pipeline.",
    icon: Upload,
  },
  {
    num: "02",
    title: "AI Processing",
    desc: "OCR extraction and intelligent parsing breaks your documents down into semantic nodes.",
    icon: Brain,
  },
  {
    num: "03",
    title: "Vector Search",
    desc: "Semantic matching runs against thousands of known architecture best practices.",
    icon: Search,
  },
  {
    num: "04",
    title: "Rule Engine",
    desc: "Automated deterministic validation against 200+ hard-coded cloud and security rules.",
    icon: Settings,
  },
  {
    num: "05",
    title: "Deep Review",
    desc: "Advanced reasoning via Gemini 2.5 and Llama evaluates trade-offs and risks.",
    icon: Sparkles,
  },
  {
    num: "06",
    title: "Scoring Report",
    desc: "A comprehensive dashboard with 6 dimensional scores, critical risks, and solutions.",
    icon: FileText,
  },
  {
    num: "07",
    title: "Context Chat",
    desc: "An interactive AI copilot ready to rewrite code or answer follow-up questions.",
    icon: MessageSquare,
  }
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 sm:py-32 bg-slate-950 text-white relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-blue-900/10 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6"
          >
            From raw specs to actionable insight.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400"
          >
            The entire pipeline executes in under three minutes.
          </motion.p>
        </div>

        <div className="mx-auto max-w-4xl relative">
          {/* Vertical connecting line */}
          <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-px bg-slate-800 -translate-x-1/2 hidden sm:block" />

          <div className="space-y-16">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <motion.div 
                  key={step.num}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-8 ${
                    isEven ? 'sm:flex-row-reverse text-left sm:text-right' : 'text-left'
                  }`}
                >
                  {/* Content Half */}
                  <div className={`flex-1 w-full sm:w-1/2 ${isEven ? 'sm:pl-16' : 'sm:pr-16'}`}>
                    <span className="text-sm font-bold text-blue-500 tracking-widest mb-2 block">
                      STEP {step.num}
                    </span>
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  {/* Center Node */}
                  <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center justify-center w-16 h-16 rounded-full bg-slate-900 border-4 border-slate-950 z-10 shadow-xl">
                    <step.icon className="w-6 h-6 text-slate-300" />
                  </div>

                  {/* Empty space for alignment */}
                  <div className="hidden sm:block flex-1 w-1/2" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
