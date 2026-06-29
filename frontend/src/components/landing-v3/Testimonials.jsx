import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      text: "ArchReview AI transformed how we validate our cloud infrastructure. We caught 3 critical vulnerabilities before deployment.",
      author: "Sarah Chen",
      role: "VP of Engineering",
      initials: "SC"
    },
    {
      text: "The automated scoring system saves our team 40+ hours per sprint on architecture reviews.",
      author: "Marcus Johnson",
      role: "CTO",
      initials: "MJ"
    },
    {
      text: "Enterprise-grade analysis that actually understands our microservices patterns. Game changer.",
      author: "Priya Patel",
      role: "Lead Architect",
      initials: "PP"
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="bg-[#0a0a0a] text-white py-24 px-6 relative overflow-hidden">
      {/* Opposite corner glows for section */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none translate-x-1/2 translate-y-1/2" />

      <div className="max-w-6xl mx-auto flex flex-col items-center relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-[#111111] px-3 py-1 text-sm text-gray-300 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white max-w-2xl">
            Why Businesses Love Our AI Solutions
          </h2>
        </div>

        {/* Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="w-full grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((t, idx) => (
            <motion.div 
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.2)' }}
              className="bg-[#111111] border border-white/10 rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group"
            >
              {/* Smooth integrated bottom glow using radial gradient */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
              
              <div className="relative z-10">
                <div>
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {/* Text */}
                  <p className="text-white/70 text-base leading-relaxed mb-8">
                    "{t.text}"
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{t.author}</div>
                    <div className="text-white/40 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default Testimonials;
