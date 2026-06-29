import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Terminal, MessageSquare, Zap, ShieldCheck, Hexagon } from 'lucide-react';

const premiumEase = [0.16, 1, 0.3, 1];

const headerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: premiumEase,
    },
  },
};

const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: premiumEase,
    },
  },
};

const innerStaggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const innerItemVariant = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: premiumEase,
    },
  },
};

const codeLineVariant = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: premiumEase,
    },
  },
};

const chatBubbleVariant = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: premiumEase,
    },
  },
};

const ServicesBento = () => {
  return (
    <section id="features" className="w-full bg-[#0a0a0a] py-24 px-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex flex-col items-center text-center mb-16"
        >
          <div className="bg-[#111111] border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <span className="text-purple-400 text-sm font-medium">Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white max-w-3xl leading-tight">
            AI Solutions That Take Your Architecture to the Next Level
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={gridContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="w-full grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          
          {/* Card 1: Delegate Daily Tasks */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3, ease: premiumEase }}
            className="bg-[#111111] border border-white/10 rounded-2xl p-8 flex flex-col h-full overflow-hidden relative group"
          >
            <div className="mb-8 z-10">
              <h3 className="text-2xl font-bold text-white mb-3">Automated review</h3>
              <p className="text-white/60">Upload project reports or architecture diagrams (JSON, YAML, Terraform, draw.io) and let our AI handle the heavy lifting of compliance and security verification.</p>
            </div>
            
            {/* UI Mockup */}
            <div className="mt-auto bg-[#1a1a1a] border border-white/5 rounded-xl p-5 shadow-2xl relative z-10 group-hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                <div>
                  <div className="text-white text-sm font-bold">Architecture Score</div>
                  <div className="text-white/40 text-[10px]">app-backend-v2.json</div>
                </div>
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">94<span className="text-lg text-white/30">/100</span></div>
              </div>
              
              <motion.div
                variants={innerStaggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="space-y-2 mb-4"
              >
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <motion.div variants={innerItemVariant} className="bg-[#111] border border-white/5 rounded-md p-2 flex justify-between">
                    <span className="text-white/60">Security</span><span className="text-green-400 font-mono">98</span>
                  </motion.div>
                  <motion.div variants={innerItemVariant} className="bg-[#111] border border-white/5 rounded-md p-2 flex justify-between">
                    <span className="text-white/60">Scalability</span><span className="text-green-400 font-mono">95</span>
                  </motion.div>
                  <motion.div variants={innerItemVariant} className="bg-[#111] border border-white/5 rounded-md p-2 flex justify-between">
                    <span className="text-white/60">Performance</span><span className="text-yellow-400 font-mono">88</span>
                  </motion.div>
                  <motion.div variants={innerItemVariant} className="bg-[#111] border border-white/5 rounded-md p-2 flex justify-between">
                    <span className="text-white/60">Reliability</span><span className="text-green-400 font-mono">92</span>
                  </motion.div>
                </div>
              </motion.div>

              <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-3">
                <div className="text-purple-300 text-[10px] font-bold uppercase mb-1">Executive Summary</div>
                <p className="text-white/70 text-xs leading-relaxed">
                  Highly resilient architecture with excellent security posture. Minor performance optimizations recommended for high-load scenarios.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Automate repetitive validations */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3, ease: premiumEase }}
            className="bg-[#111111] border border-white/10 rounded-2xl p-8 flex flex-col h-full overflow-hidden relative group"
          >
            <div className="mb-8 z-10">
              <h3 className="text-2xl font-bold text-white mb-3">Actionable insights</h3>
              <p className="text-white/60">Get prioritized, ready-to-implement solutions for every vulnerability and architectural bottleneck identified.</p>
            </div>
            
            {/* UI Mockup */}
            <div className="mt-auto bg-[#050505] border border-white/5 rounded-xl p-5 shadow-2xl relative z-10 group-hover:border-white/10 transition-colors flex flex-col gap-3">
              <motion.div
                variants={innerStaggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="w-full"
              >
                <motion.div variants={innerItemVariant} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-red-400 text-xs font-bold uppercase">Critical Insight</span>
                    <span className="text-red-400/50 text-[10px]">API Gateway</span>
                  </div>
                  <p className="text-white/80 text-sm mb-3">Missing WAF protection on public endpoints.</p>
                  <button className="bg-red-500/20 text-red-300 text-xs px-3 py-1.5 rounded-md hover:bg-red-500/30 transition-colors">Apply Fix</button>
                </motion.div>

                <motion.div variants={innerItemVariant} className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-yellow-400 text-xs font-bold uppercase">Optimization</span>
                    <span className="text-yellow-400/50 text-[10px]">Database</span>
                  </div>
                  <p className="text-white/80 text-sm">Single point of failure detected in master node.</p>
                </motion.div>

                <motion.div variants={innerItemVariant} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-red-400 text-xs font-bold uppercase">Critical Insight</span>
                    <span className="text-red-400/50 text-[10px]">Auth Service</span>
                  </div>
                  <p className="text-white/80 text-sm mb-3">No rate limiting configured on auth endpoints.</p>
                  <button className="bg-red-500/20 text-red-300 text-xs px-3 py-1.5 rounded-md hover:bg-red-500/30 transition-colors">Apply Fix</button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Card 3: Accelerate Development (Massive Bottom Column) */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3, ease: premiumEase }}
            className="md:col-span-2 bg-[#111111] border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 overflow-hidden relative group"
          >
            {/* Background Glow */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-600/20 blur-[80px] rounded-full pointer-events-none" />

            <div className="md:w-1/2 z-10">
              <h3 className="text-3xl font-bold text-white mb-4">Ai chat assistant</h3>
              <p className="text-white/60 text-lg mb-6">
                Get instant feedback on your architectural decisions. Our AI assistant helps you resolve complex scalability bottlenecks before they hit production.
              </p>
              <motion.ul
                variants={innerStaggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="space-y-2"
              >
                <motion.li variants={innerItemVariant} className="flex items-center gap-2 text-white/70">
                  <Zap className="w-4 h-4 text-purple-500" /> Real-time insights
                </motion.li>
                <motion.li variants={innerItemVariant} className="flex items-center gap-2 text-white/70">
                  <Zap className="w-4 h-4 text-purple-500" /> Automated remediation
                </motion.li>
              </motion.ul>
            </div>
            
            {/* UI Mockup */}
            <div className="md:w-1/2 w-full mt-6 md:mt-0 bg-[#1a1a1a] border border-white/5 rounded-xl p-1 shadow-2xl relative z-10 group-hover:border-white/10 transition-colors">
              <motion.div
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.2,
                      delayChildren: 0.4,
                    },
                  },
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="bg-[#0a0a0a] rounded-lg p-4 h-full flex flex-col gap-4"
              >
                <motion.div variants={chatBubbleVariant} className="flex gap-3">
                  <div className="w-6 h-6 rounded-md bg-purple-600/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-3 h-3 text-purple-400" />
                  </div>
                  <div className="bg-[#1a1a1a] p-3 rounded-xl rounded-tl-none border border-white/5">
                    <p className="text-white/80 text-sm">How should we structure the new payment microservice?</p>
                  </div>
                </motion.div>
                
                <motion.div variants={chatBubbleVariant} className="flex gap-3 flex-row-reverse">
                  <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center shrink-0">
                    <Hexagon className="w-3 h-3 text-white/50" />
                  </div>
                  <div className="bg-purple-600/10 p-3 rounded-xl rounded-tr-none border border-purple-500/20 w-full">
                    <p className="text-white/90 text-sm mb-3">Based on your current event-driven architecture, I recommend:</p>
                    <div className="space-y-2">
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: '75%' }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: premiumEase, delay: 1.0 }}
                          className="h-full bg-purple-500 rounded-full"
                        />
                      </div>
                      <div className="text-white/40 text-xs text-right">CQRS Pattern Match: 75%</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default ServicesBento;
