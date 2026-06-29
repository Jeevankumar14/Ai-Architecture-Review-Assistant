import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Cpu, Database, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── helpers ─── */
const randomBetween = (min, max) => Math.random() * (max - min) + min;

const generateEdgePosition = () => {
  const edge = Math.floor(Math.random() * 4); // 0=top 1=right 2=bottom 3=left
  switch (edge) {
    case 0: // top
      return { x: randomBetween(-50, 50), y: -50 };
    case 1: // right
      return { x: 55, y: randomBetween(-50, 50) };
    case 2: // bottom
      return { x: randomBetween(-50, 50), y: 55 };
    case 3: // left
      return { x: -55, y: randomBetween(-50, 50) };
    default:
      return { x: 0, y: -50 };
  }
};

const PARTICLE_COUNT = 45;

const createParticles = () =>
  Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const start = generateEdgePosition();
    return {
      id: i,
      startX: start.x,   // percentage of container
      startY: start.y,
      duration: randomBetween(4, 9),
      delay: randomBetween(0, 6),
      size: randomBetween(1.5, 3),
    };
  });

/* ─── Particle ─── */
const Particle = ({ startX, startY, duration, delay, size }) => (
  <motion.div
    className="absolute rounded-full bg-white pointer-events-none"
    style={{
      width: size,
      height: size,
      left: '50%',
      top: '55%', // Adjust target slightly down toward the mockup center
    }}
    initial={{
      x: `${startX}vw`,
      y: `${startY}vh`,
      opacity: 0,
      scale: 1,
    }}
    animate={{
      x: '0vw',
      y: '-5vh', // Target the 3D cube center
      opacity: [0, 0.8, 0.8, 0],
      scale: 0.2,
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      repeatDelay: randomBetween(0.5, 1.5),
      ease: 'easeIn',
    }}
  />
);

/* ─── main component ─── */
const HeroSection = () => {
  const [particles, setParticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setParticles(createParticles());
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section className="relative w-full bg-[#0a0a0a] min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden px-6">
      {/* ── Particle field ── */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {particles.map((p) => (
          <Particle key={p.id} {...p} />
        ))}
      </div>

      {/* ── Central glowing architecture diagram (SVG shape) ── */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[1] w-[350px] h-[350px] md:w-[600px] md:h-[600px] flex items-center justify-center" aria-hidden="true">
        {/* Ambient glow behind the diagram */}
        <motion.div
          className="absolute inset-0 bg-purple-600/15 blur-[60px] md:blur-[100px] rounded-full"
          animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Sharp SVG Diagram - Balanced Opacity for Text Dominance */}
        <motion.div
          className="w-full h-full opacity-60 drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]"
          animate={{ scale: [1, 1.02, 1], opacity: [0.45, 0.65, 0.45] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="topFace" x1="300" y1="150" x2="300" y2="300" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#d8b4fe" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="rightFace" x1="300" y1="300" x2="430" y2="375" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#9333ea" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="leftFace" x1="300" y1="300" x2="170" y2="375" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7e22ce" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3730a3" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="wireframe" x1="0" y1="0" x2="600" y2="600">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>

            {/* Outer Glowing Wireframe Cube */}
            <g stroke="url(#wireframe)" strokeWidth="2" strokeLinejoin="round" fill="none" opacity="0.5">
              <path d="M 300 100 L 473.2 200 L 300 300 L 126.8 200 Z" />
              <path d="M 300 300 L 473.2 200 L 473.2 400 L 300 500 Z" />
              <path d="M 300 300 L 126.8 200 L 126.8 400 L 300 500 Z" />
              {/* Internal wireframe grid lines for tech look */}
              <line x1="386.6" y1="150" x2="213.4" y2="250" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="213.4" y1="150" x2="386.6" y2="250" strokeWidth="1" strokeDasharray="4 4" />
            </g>

            {/* Inner Solid Shining Core Cube */}
            <g stroke="#ffffff" strokeWidth="1" strokeLinejoin="round" opacity="0.75">
              {/* Top Face - Brightest */}
              <path d="M 300 180 L 403.9 240 L 300 300 L 196.1 240 Z" fill="url(#topFace)" />
              {/* Right Face - Medium */}
              <path d="M 300 300 L 403.9 240 L 403.9 360 L 300 420 Z" fill="url(#rightFace)" />
              {/* Left Face - Darkest */}
              <path d="M 300 300 L 196.1 240 L 196.1 360 L 300 420 Z" fill="url(#leftFace)" />
            </g>
            
            {/* Energy Core Highlight (Top vertex) */}
            <circle cx="300" cy="180" r="3.5" fill="#ffffff" filter="blur(1px)" opacity="0.8"/>
            <circle cx="300" cy="300" r="3.5" fill="#ffffff" filter="blur(2px)" opacity="0.8"/>
          </svg>
        </motion.div>
      </div>

      {/* ── Content ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Pill badge */}
        <motion.div
          variants={fadeUp}
          className="flex items-center gap-2 bg-[#111111] border border-white/10 rounded-full px-3 py-1.5 mb-8"
        >
          <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            New
          </span>
          <span className="text-white/80 text-sm font-medium flex items-center gap-1.5">
            Automated Architecture Review{' '}
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight drop-shadow-xl"
        >
          Intelligent Architecture{' '}
          <br className="hidden md:block" />
          Review for Modern{' '}
          <br className="hidden md:block" />
          Engineering.
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={fadeUp}
          className="text-lg md:text-xl text-white/80 max-w-2xl mb-10 drop-shadow-md"
        >
          ArchReview brings AI architecture validation to your fingertips to catch
          vulnerabilities, ensure compliance, and scale with confidence.
        </motion.p>

        {/* Buttons */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button onClick={() => navigate('/register')} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-3.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20">
            Get started <ArrowRight className="w-4 h-4" />
          </button>
          <button className="w-full sm:w-auto bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10 text-white px-8 py-3.5 rounded-lg font-medium transition-all">
            View demo
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
