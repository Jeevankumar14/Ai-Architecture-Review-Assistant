import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const premiumEase = [0.16, 1, 0.3, 1];

const FinalCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-[#111111]/85 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 flex flex-col items-center text-center relative overflow-hidden shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: premiumEase }}
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Opposite corner glows */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-600/30 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-indigo-600/30 blur-[80px] rounded-full pointer-events-none" />
          
          <motion.h2
            className="text-3xl md:text-5xl font-bold tracking-tight text-white max-w-2xl mb-6 relative z-10 drop-shadow-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: premiumEase }}
            viewport={{ once: true, amount: 0.2 }}
          >
            Let AI do the work so you can scale faster
          </motion.h2>
          
          <motion.p
            className="text-base md:text-lg text-white/70 max-w-xl mb-10 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: premiumEase }}
            viewport={{ once: true, amount: 0.2 }}
          >
            Transform your architecture review process today in under 5 minutes
          </motion.p>
          
          <motion.button
            onClick={() => navigate('/register')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-3.5 rounded-lg transition-colors relative z-10 shadow-lg shadow-purple-500/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: premiumEase }}
            viewport={{ once: true, amount: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Free Trial
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
