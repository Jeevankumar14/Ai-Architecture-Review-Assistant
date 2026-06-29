import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

const ComparisonSection = () => {
  const comparisons = [
    { label: "Review Time", traditional: "2-3 weeks of meetings", ai: "Seconds" },
    { label: "Coverage", traditional: "Sample-based human review", ai: "100% codebase and docs" },
    { label: "Standards", traditional: "Inconsistent team knowledge", ai: "Strictly enforced best practices" },
    { label: "Cost", traditional: "Expensive senior architect time", ai: "Fraction of the cost" },
    { label: "Documentation", traditional: "Outdated wikis", ai: "Auto-generated living diagrams" }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-4xl font-light tracking-tight text-slate-900 mb-4">The new standard for architecture reviews.</h2>
          <p className="text-lg text-slate-500 font-light">Stop wasting engineering cycles on manual diagram validation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0">
          {/* Traditional Column */}
          <div className="col-span-1">
            <h3 className="text-xl font-medium text-slate-400 mb-8 pb-4 border-b border-slate-100">Traditional Review</h3>
            <ul className="space-y-0">
              {comparisons.map((item, idx) => (
                <li key={`trad-${idx}`} className="py-6 border-b border-slate-100 flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{item.label}</span>
                  <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-slate-500 font-light">{item.traditional}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Column */}
          <div className="col-span-1 mt-16 md:mt-0">
            <h3 className="text-xl font-medium text-slate-900 mb-8 pb-4 border-b border-slate-200">ArchReview AI</h3>
            <ul className="space-y-0">
              {comparisons.map((item, idx) => (
                <li key={`ai-${idx}`} className="py-6 border-b border-slate-200 flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 md:hidden">{item.label}</span>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-slate-900 font-medium">{item.ai}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
