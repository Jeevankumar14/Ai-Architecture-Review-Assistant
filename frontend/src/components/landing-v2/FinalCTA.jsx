import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const FinalCTA = () => {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="bg-slate-950 rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-slate-800 p-12 md:p-24 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-16 group">
          
          {/* Subtle hover glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

          <div className="max-w-2xl relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white leading-[1.1] mb-6">
              Ready to review your architecture?
            </h2>
            <p className="text-lg md:text-xl text-slate-400 font-medium">
              Deploy your first automated review in under 5 minutes.
            </p>
          </div>
          
          <div className="shrink-0 w-full lg:w-auto relative z-10">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between gap-8 bg-white text-slate-950 px-8 py-5 rounded-2xl w-full lg:w-auto hover:bg-slate-100 transition-colors shadow-lg"
            >
              <span className="text-xl font-bold tracking-tight">Start Free Trial</span>
              <div className="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center transition-transform">
                <ArrowRight strokeWidth={2.5} className="w-5 h-5" />
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
