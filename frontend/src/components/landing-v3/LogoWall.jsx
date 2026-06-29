import React from 'react';
import { motion } from 'framer-motion';
import { Hexagon, Triangle, Circle, Square, Infinity as InfinityIcon } from 'lucide-react';

const LogoWall = () => {
  const logos = [
    { icon: <Hexagon className="w-5 h-5" />, name: 'Acme Corp' },
    { icon: <Triangle className="w-5 h-5" />, name: 'TechFlow' },
    { icon: <Circle className="w-5 h-5" />, name: 'NexusData' },
    { icon: <Square className="w-5 h-5" />, name: 'Globex' },
    { icon: <InfinityIcon className="w-5 h-5" />, name: 'NovaTech' },
  ];

  // Duplicate the array to create a seamless infinite loop
  const duplicatedLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <section className="w-full bg-[#0a0a0a] py-12 border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center relative">
        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

        <p className="text-white/40 text-sm font-medium mb-8 text-center px-6 uppercase tracking-wider">
          Trusted by engineering teams at
        </p>
        
        <div className="flex overflow-hidden whitespace-nowrap w-full opacity-60">
          <motion.div
            className="flex items-center gap-16 pr-16"
            animate={{
              x: ['0%', '-50%'],
            }}
            transition={{
              duration: 20,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {duplicatedLogos.map((logo, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-white/80 grayscale flex-shrink-0"
              >
                {logo.icon}
                <span className="font-semibold text-lg tracking-tight">{logo.name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LogoWall;
