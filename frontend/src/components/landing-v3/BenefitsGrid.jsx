import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, ShieldCheck, Clock, Layers, Cpu } from 'lucide-react';

const premiumEase = [0.16, 1, 0.3, 1];

const gridContainerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const gridItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: premiumEase },
  },
};

const BenefitsGrid = () => {
  const benefits = [
    {
      icon: <Zap className="w-5 h-5 text-purple-400" />,
      title: "Increased Productivity",
      description: "Automate repetitive review tasks and let your engineers focus on building core features."
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-green-400" />,
      title: "Cost Reduction",
      description: "Lower operational costs by minimizing manual oversight and preventing expensive bugs early."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-blue-400" />,
      title: "Enhanced Security",
      description: "Identify vulnerabilities in your architecture before they make it to production."
    },
    {
      icon: <Clock className="w-5 h-5 text-orange-400" />,
      title: "Faster Time-to-Market",
      description: "Accelerate your development lifecycle with instant feedback on architectural decisions."
    },
    {
      icon: <Layers className="w-5 h-5 text-pink-400" />,
      title: "Scalable Infrastructure",
      description: "Ensure your system is built to handle growth with AI-driven scalability recommendations."
    },
    {
      icon: <Cpu className="w-5 h-5 text-indigo-400" />,
      title: "Smarter Resource Allocation",
      description: "Optimize cloud spend and resource usage with intelligent infrastructure profiling."
    }
  ];

  return (
    <section className="py-24 px-4 max-w-7xl mx-auto relative overflow-hidden">
      {/* Opposite corner glows for section */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none translate-x-1/2 translate-y-1/2" />

      <div className="flex flex-col items-center text-center mb-16 relative z-10">
        <motion.div
          className="inline-flex items-center rounded-full border border-white/10 bg-[#111111] px-3 py-1 text-sm text-gray-300 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: premiumEase }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
          Benefits
        </motion.div>
        <motion.h2
          className="text-4xl md:text-5xl font-medium tracking-tight text-white max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: premiumEase }}
          viewport={{ once: true, amount: 0.2 }}
        >
          The Key Benefits of AI for Your Engineering
        </motion.h2>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={gridContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            className="bg-[#111111] border border-white/10 rounded-xl p-6 transition-all hover:bg-[#151515] relative overflow-hidden group"
            variants={gridItemVariants}
            whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.2)' }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {/* Smooth integrated bottom glow */}
            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-4/5 h-40 bg-purple-600/40 blur-[50px] opacity-100 pointer-events-none" />
            
            <div className="relative z-10">
              <motion.div
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                {benefit.icon}
              </motion.div>
              <h3 className="text-lg font-medium text-white mb-2">{benefit.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default BenefitsGrid;
