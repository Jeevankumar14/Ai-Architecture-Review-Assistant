import React from 'react';
import { Globe, Database, GitBranch, Shield, Cpu } from 'lucide-react';

const TrustSection = () => {
  const logos = [
    { icon: Globe, name: "GLOBALTECH" },
    { icon: Database, name: "DATASCALE" },
    { icon: GitBranch, name: "NEXUSFLOW" },
    { icon: Shield, name: "SECURENET" },
    { icon: Cpu, name: "SYNAPSE" },
  ];

  return (
    <section className="w-full py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center">
        <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-10 text-center">
          Empowering Teams At
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 w-full">
          {logos.map((logo, index) => {
            const Icon = logo.icon;
            return (
              <div 
                key={index} 
                className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-all duration-300 cursor-default grayscale hover:grayscale-0"
              >
                <Icon className="w-6 h-6 text-slate-800" strokeWidth={1.5} />
                <span className="text-lg font-bold tracking-tight text-slate-800 uppercase">
                  {logo.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
