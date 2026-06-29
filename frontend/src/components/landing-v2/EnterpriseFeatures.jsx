import React from 'react';
import { motion } from 'framer-motion';
import { Database, Search, Cloud, Brain, Lock, Server } from 'lucide-react';

const EnterpriseFeatures = () => {
  const stack = [
    { name: "Amazon S3", icon: <Cloud className="w-5 h-5" /> },
    { name: "Vector Search", icon: <Search className="w-5 h-5" /> },
    { name: "Google Gemini", icon: <Brain className="w-5 h-5" /> },
    { name: "Llama 3", icon: <Brain className="w-5 h-5" /> },
    { name: "MongoDB", icon: <Database className="w-5 h-5" /> },
    { name: "OCR Processing", icon: <Search className="w-5 h-5" /> },
    { name: "Enterprise Auth", icon: <Lock className="w-5 h-5" /> },
    { name: "Edge Compute", icon: <Server className="w-5 h-5" /> },
  ];

  // Repeat the array for seamless looping
  const marqueeItems = [...stack, ...stack, ...stack];

  return (
    <section className="py-24 bg-slate-50 overflow-hidden border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-6 mb-16 flex items-center justify-center">
        <h2 className="text-xl font-light tracking-tight text-slate-500">Powered by enterprise-grade infrastructure</h2>
      </div>

      <div className="relative w-full flex overflow-x-hidden">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>
        
        <motion.div
          className="flex whitespace-nowrap gap-8 py-4 px-4"
          animate={{ x: ["0%", "-33.333333%"] }}
          transition={{
            ease: "linear",
            duration: 25,
            repeat: Infinity,
          }}
        >
          {marqueeItems.map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 text-slate-700 shrink-0 shadow-sm"
            >
              {item.icon}
              <span className="text-base font-medium tracking-wide">{item.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default EnterpriseFeatures;
