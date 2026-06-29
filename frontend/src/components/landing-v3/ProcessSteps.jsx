import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const premiumEase = [0.16, 1, 0.3, 1];

const cardVariants = (delay) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: premiumEase },
  viewport: { once: true, amount: 0.2 },
});

const checklistContainerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const checklistItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: premiumEase } },
};

const codeContainerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const codeLineVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: premiumEase } },
};

const ProcessSteps = () => {
  return (
    <section className="py-24 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col items-center text-center mb-16">
        <motion.div
          className="inline-flex items-center rounded-full border border-white/10 bg-[#111111] px-3 py-1 text-sm text-gray-300 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: premiumEase }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
          Our Process
        </motion.div>
        <motion.h2
          className="text-4xl md:text-5xl font-medium tracking-tight text-white max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: premiumEase }}
          viewport={{ once: true, amount: 0.2 }}
        >
          Our Simple, Smart, and Scalable Process
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1 */}
        <motion.div
          className="bg-[#111111] border border-white/10 rounded-2xl p-8 flex flex-col"
          {...cardVariants(0)}
          whileHover={{ y: -5 }}
          // eslint-disable-next-line react/jsx-no-duplicate-props
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-medium text-white mb-2">1. Ingest Architecture</h3>
            <p className="text-gray-400 text-sm">Connect your cloud environment or upload your system design files (JSON, YAML, Terraform).</p>
          </div>
          <div className="mt-auto bg-[#0a0a0a] border border-white/5 rounded-xl p-6">
            <motion.div
              className="space-y-4"
              variants={checklistContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <motion.div className="flex items-center gap-3" variants={checklistItemVariants}>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-300 font-mono">System check complete</span>
              </motion.div>
              <motion.div className="flex items-center gap-3" variants={checklistItemVariants}>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-300 font-mono">Process check complete</span>
              </motion.div>
              <motion.div className="flex items-center gap-3" variants={checklistItemVariants}>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-300 font-mono">Security check complete</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Step 2 */}
        <motion.div
          className="bg-[#111111] border border-white/10 rounded-2xl p-8 flex flex-col"
          {...cardVariants(0.1)}
          whileHover={{ y: -5 }}
          // eslint-disable-next-line react/jsx-no-duplicate-props
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-medium text-white mb-2">2. Automated Review</h3>
            <p className="text-gray-400 text-sm">Our AI engine instantly scans your architecture for security vulnerabilities, scalability limits, and compliance.</p>
          </div>
          <motion.div
            className="mt-auto bg-[#0a0a0a] border border-white/5 rounded-xl p-6 font-mono text-sm"
            variants={codeContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div className="text-purple-400" variants={codeLineVariants}>def <span className="text-blue-400">trigger</span>():</motion.div>
            <motion.div className="pl-4 text-gray-400" variants={codeLineVariants}># Initialize the AI pipeline</motion.div>
            <motion.div className="pl-4 text-yellow-300" variants={codeLineVariants}>pipeline = <span className="text-white">AIPipeline()</span></motion.div>
            <motion.div className="pl-4 text-yellow-300" variants={codeLineVariants}>pipeline.<span className="text-blue-400">run_analysis</span>()</motion.div>
            <motion.div className="pl-4 text-purple-400" variants={codeLineVariants}>return <span className="text-green-400">"Success"</span></motion.div>
          </motion.div>
        </motion.div>

        {/* Step 3 */}
        <motion.div
          className="bg-[#111111] border border-white/10 rounded-2xl p-8 flex flex-col"
          {...cardVariants(0.2)}
          whileHover={{ y: -5 }}
          // eslint-disable-next-line react/jsx-no-duplicate-props
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-medium text-white mb-2">3. Actionable Insights</h3>
            <p className="text-gray-400 text-sm">Get clear, actionable recommendations directly integrated into your team's workflow and issue trackers.</p>
          </div>
          <div className="mt-auto bg-[#0a0a0a] border border-white/5 rounded-xl p-8 flex items-center justify-between relative overflow-hidden">
             <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent -translate-y-1/2 opacity-50"></div>
             <div className="z-10 bg-[#111111] border border-purple-500/30 rounded-lg py-2 px-4 text-sm font-medium text-purple-400">Our solution</div>
             <ArrowRight className="w-5 h-5 text-purple-500 z-10" />
             <div className="z-10 bg-[#111111] border border-white/10 rounded-lg py-2 px-4 text-sm font-medium text-gray-300">Your stack</div>
          </div>
        </motion.div>

        {/* Step 4 */}
        <motion.div
          className="bg-[#111111] border border-white/10 rounded-2xl p-8 flex flex-col"
          {...cardVariants(0.3)}
          whileHover={{ y: -5 }}
          // eslint-disable-next-line react/jsx-no-duplicate-props
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-medium text-white mb-2">4. Continuous Monitoring</h3>
            <p className="text-gray-400 text-sm">Monitor drift in your architecture and prevent bad design decisions from ever reaching production.</p>
          </div>
          <div className="mt-auto bg-[#0a0a0a] border border-white/5 rounded-xl p-6 space-y-4">
             <div>
               <div className="flex justify-between text-xs mb-1">
                 <span className="text-gray-400">Model Accuracy</span>
                 <span className="text-green-400">98%</span>
               </div>
               <div className="w-full bg-white/5 rounded-full h-1.5">
                 <motion.div
                   className="bg-green-500 h-1.5 rounded-full"
                   initial={{ width: '0%' }}
                   whileInView={{ width: '98%' }}
                   transition={{ duration: 1.5, ease: 'easeOut' }}
                   viewport={{ once: true, amount: 0.2 }}
                 />
               </div>
             </div>
             <div>
               <div className="flex justify-between text-xs mb-1">
                 <span className="text-gray-400">Processing Speed</span>
                 <span className="text-purple-400">Optimized</span>
               </div>
               <div className="w-full bg-white/5 rounded-full h-1.5">
                 <motion.div
                   className="bg-purple-500 h-1.5 rounded-full"
                   initial={{ width: '0%' }}
                   whileInView={{ width: '85%' }}
                   transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                   viewport={{ once: true, amount: 0.2 }}
                 />
               </div>
             </div>
             <div>
               <div className="flex justify-between text-xs mb-1">
                 <span className="text-gray-400">Resource Usage</span>
                 <span className="text-blue-400">Stable</span>
               </div>
               <div className="w-full bg-white/5 rounded-full h-1.5">
                 <motion.div
                   className="bg-blue-500 h-1.5 rounded-full"
                   initial={{ width: '0%' }}
                   whileInView={{ width: '40%' }}
                   transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
                   viewport={{ once: true, amount: 0.2 }}
                 />
               </div>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessSteps;
