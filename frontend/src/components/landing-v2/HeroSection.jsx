import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Database, Server, Cloud, ShieldAlert, Cpu, GitBranch } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative min-h-[100dvh] bg-[#FAFBFC] overflow-hidden flex items-center">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center pt-24 lg:pt-0">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start justify-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] text-slate-900 mb-6">
              Automate Your <br />Architecture Reviews
            </h1>
            <p className="text-lg text-slate-600 max-w-[28rem] mb-10 leading-relaxed font-medium">
              Instantly validate system designs against enterprise standards. Catch vulnerabilities and bottlenecks before a single line of code is written.
            </p>
            <div className="flex items-center gap-4">
              <button className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg bg-blue-600 px-8 font-semibold text-white transition-all duration-300 hover:bg-blue-700 shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_-5px_rgba(37,99,235,0.6)]">
                <span className="flex items-center gap-2">
                  Analyze Your Design
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </div>
          </motion.div>

          {/* Right Visual - Architecture Graph Scanner */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center group"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem]" />
            
            {/* Architecture Node Graph */}
            <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
              
              {/* Connection Lines (SVG) */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                {/* LB to API */}
                <motion.path d="M 200 80 L 120 180" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="2" fill="none" />
                <motion.path d="M 200 80 L 120 180" stroke="#3b82f6" strokeWidth="2" fill="none" 
                  initial={{ strokeDasharray: "10 20", strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                
                {/* LB to Auth */}
                <motion.path d="M 200 80 L 280 180" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="2" fill="none" />
                <motion.path d="M 200 80 L 280 180" stroke="#3b82f6" strokeWidth="2" fill="none" 
                  initial={{ strokeDasharray: "10 20", strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />

                {/* API to DB */}
                <motion.path d="M 120 180 L 200 300" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="2" fill="none" />
                <motion.path d="M 120 180 L 200 300" stroke="#f43f5e" strokeWidth="2" fill="none" 
                  initial={{ strokeDasharray: "5 15", strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* Auth to DB */}
                <motion.path d="M 280 180 L 200 300" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="2" fill="none" />
              </svg>

              {/* Node 1: Load Balancer (Top) */}
              <div className="absolute top-[60px] left-[180px] w-10 h-10 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center z-10 shadow-lg">
                <Cloud className="w-5 h-5 text-slate-400" />
              </div>

              {/* Node 2: API Service (Left) */}
              <div className="absolute top-[160px] left-[100px] w-10 h-10 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center z-10 shadow-lg">
                <Server className="w-5 h-5 text-slate-400" />
              </div>

              {/* Node 3: Auth Service (Right) */}
              <div className="absolute top-[160px] left-[260px] w-10 h-10 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center z-10 shadow-lg">
                <Cpu className="w-5 h-5 text-slate-400" />
              </div>

              {/* Node 4: Primary DB (Bottom) */}
              <div className="absolute top-[280px] left-[180px] w-10 h-10 bg-slate-900 border-2 border-rose-500/50 rounded-xl flex items-center justify-center z-10 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <Database className="w-5 h-5 text-rose-400" />
                {/* Risk Tooltip */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2, duration: 0.5 }}
                  className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-48 bg-rose-500/10 border border-rose-500/30 backdrop-blur-md rounded-lg p-3 shadow-xl"
                >
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-rose-300 uppercase tracking-wider mb-1">Risk Detected</p>
                      <p className="text-xs text-rose-200/70 leading-tight">Missing read-replica configuration for high-availability.</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* AI Scanner Beam */}
              <motion.div 
                className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-blue-500/10 to-blue-400/30 border-b-2 border-blue-400/50 z-20 blur-[1px]"
                animate={{ top: ['-20%', '120%'] }}
                transition={{ duration: 4, ease: "linear", repeat: Infinity }}
              />
            </div>
            
            {/* Overlay Header */}
            <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-full z-30">
              <GitBranch className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] font-mono font-medium text-slate-300">Evaluating HLD.yml</span>
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
