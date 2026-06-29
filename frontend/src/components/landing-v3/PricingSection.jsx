import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Rocket, Zap, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();

  const plans = [
    {
      icon: <Rocket className="w-6 h-6 text-purple-400" />,
      title: "Starter",
      price: 0,
      description: "Perfect for small teams starting with AI architecture review.",
      popular: false,
      buttonText: "Start free trial",
      features: [
        "Basic architecture review",
        "AI-powered scoring",
        "Standard analytics & reporting",
        "Email & chat support",
        "Up to 3 project reviews"
      ]
    },
    {
      icon: <Zap className="w-6 h-6 text-purple-400" />,
      title: "Professional",
      price: isAnnual ? 59 : 75,
      description: "Perfect for growing teams with advanced architecture needs.",
      popular: true,
      buttonText: "Choose this plan",
      features: [
        "Advanced architecture review",
        "AI-driven security analysis",
        "Enhanced data analytics & insights",
        "Priority customer support",
        "Up to 10 project reviews"
      ]
    },
    {
      icon: <Crown className="w-6 h-6 text-purple-400" />,
      title: "Enterprise",
      price: "Custom",
      description: "Perfect for large organizations with custom architecture needs.",
      popular: false,
      buttonText: "Contact sales",
      features: [
        "Fully customizable AI review",
        "Dedicated architecture consultant",
        "Enterprise-grade compliance",
        "24/7 VIP support",
        "Unlimited project reviews"
      ]
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="pricing" className="bg-[#0a0a0a] text-white py-24 px-6 relative overflow-hidden">
      {/* Background glow behind pricing */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Toggle & Title */}
        <div className="flex flex-col items-center text-center mb-16 relative z-10 w-full">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-sm md:text-base text-white/60 mb-10 max-w-xl">
            Choose a plan that fits for your business needs and start reviewing with ArchReview.
          </p>

          <div className="flex items-center gap-5">
            <span 
              onClick={() => setIsAnnual(false)}
              className={`text-sm md:text-base font-medium cursor-pointer transition-colors ${!isAnnual ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              Monthly
            </span>
            
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 border border-white/20 rounded-full flex items-center p-1 cursor-pointer hover:border-white/40 transition-colors focus:outline-none ${isAnnual ? 'bg-purple-600' : 'bg-[#111111]'}`}
              aria-label="Toggle annual pricing"
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-md"
                animate={{ x: isAnnual ? 28 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
            
            <span 
              onClick={() => setIsAnnual(true)}
              className={`text-sm md:text-base font-medium cursor-pointer flex items-center gap-2 transition-colors ${isAnnual ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              Annually
              <span className="bg-purple-900/40 text-purple-300 border border-purple-500/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full hidden sm:inline-block">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10"
        >
          {plans.map((plan, idx) => (
            <motion.div 
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -6, borderColor: 'rgba(255,255,255,0.2)' }}
              className={`bg-[#111111] border border-white/10 rounded-2xl p-8 flex flex-col h-full relative transition-all duration-300 ${plan.popular ? 'shadow-[0_0_40px_-10px_rgba(147,51,234,0.3)] border-purple-500/30' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 right-6 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Popular
                </div>
              )}

              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{plan.title}</h3>
                <p className="text-white/40 text-sm">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">
                  {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                </span>
                {typeof plan.price === 'number' && (
                  <span className="text-white/40 text-sm ml-1">/month</span>
                )}
              </div>

              <button 
                onClick={() => plan.buttonText === 'Contact sales' ? window.location.href='mailto:sales@archreview.ai' : navigate('/register')}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${plan.popular ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_20px_-5px_rgba(147,51,234,0.5)]' : 'bg-transparent hover:bg-white/5 border border-white/20 text-white'}`}>
                {plan.buttonText}
              </button>

              <div className="mt-auto space-y-4">
                <div className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">What's Included:</div>
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="text-white/80 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default PricingSection;
