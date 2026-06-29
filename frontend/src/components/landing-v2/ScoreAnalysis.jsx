import React from 'react';
import { motion } from 'framer-motion';

const ScoreRing = ({ score, label }) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="transform -rotate-90 w-32 h-32 absolute inset-0">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            className="text-slate-100"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={circumference}
            className="text-blue-600"
          />
        </svg>
        <span className="text-4xl font-black tracking-tighter text-slate-900">{score}</span>
      </div>
      <span className="text-sm font-medium tracking-wide text-slate-500 uppercase">{label}</span>
    </div>
  );
};

const ScoreAnalysis = () => {
  const scores = [
    { label: "Security", score: 98 },
    { label: "Scalability", score: 94 },
    { label: "Reliability", score: 99 },
    { label: "Performance", score: 92 },
    { label: "Cost Opt", score: 88 },
    { label: "Compliance", score: 100 }
  ];

  return (
    <section className="py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-24">
          <h2 className="text-4xl font-light tracking-tight text-slate-900 mb-4">Granular architectural analysis.</h2>
          <p className="text-lg text-slate-500 font-light">Deep inspection across six critical dimensions of your system.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-24 gap-x-8">
          {scores.map((item, idx) => (
            <ScoreRing key={idx} score={item.score} label={item.label} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScoreAnalysis;
