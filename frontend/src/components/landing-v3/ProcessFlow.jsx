import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Database, Cpu, MessageSquare, ArrowRight } from 'lucide-react';

const premiumEase = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.7, ease: premiumEase } 
  },
};

const ProcessFlow = () => {
  const steps = [
    {
      id: 1,
      title: "Document Ingestion",
      tech: "Amazon S3 → OCR",
      description: "User uploads trigger document detection. Diagrams are parsed via OCR, and metadata is securely extracted.",
      icon: <UploadCloud className="w-6 h-6 text-purple-400" />,
      color: "from-purple-500/20 to-purple-500/5",
      borderColor: "border-purple-500/20"
    },
    {
      id: 2,
      title: "Vector Processing",
      tech: "BGE Embeddings → MongoDB Atlas",
      description: "Architecture is parsed, chunked, and embedded into a vector database for lightning-fast hybrid retrieval.",
      icon: <Database className="w-6 h-6 text-indigo-400" />,
      color: "from-indigo-500/20 to-indigo-500/5",
      borderColor: "border-indigo-500/20"
    },
    {
      id: 3,
      title: "RAG Knowledge Base",
      tech: "AWS Well-Architected → OWASP",
      description: "Grounded strictly in AWS Well-Architected Framework and OWASP standards to retrieve the most relevant best practices.",
      icon: <Database className="w-6 h-6 text-cyan-400" />,
      color: "from-cyan-500/20 to-cyan-500/5",
      borderColor: "border-cyan-500/20"
    },
    {
      id: 4,
      title: "Intelligent Analysis",
      tech: "Rule Engine → Gemini 2.5 Flash",
      description: "Retrieved context passes through our rule engine to Google Gemini for a comprehensive architecture review.",
      icon: <Cpu className="w-6 h-6 text-blue-400" />,
      color: "from-blue-500/20 to-blue-500/5",
      borderColor: "border-blue-500/20"
    },
    {
      id: 5,
      title: "Interactive Follow-up",
      tech: "Chat Session → Groq Llama 3.3",
      description: "Discuss the review instantly. Groq's ultra-fast inference powers real-time chat based on your architecture.",
      icon: <MessageSquare className="w-6 h-6 text-emerald-400" />,
      color: "from-emerald-500/20 to-emerald-500/5",
      borderColor: "border-emerald-500/20"
    }
  ];

  return (
    <section className="w-full bg-[#0a0a0a] py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: premiumEase }}
          className="flex flex-col items-center text-center mb-20"
        >
          <div className="bg-[#111111] border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <span className="text-purple-400 text-sm font-medium">How it works</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white max-w-3xl leading-tight">
            How our AI architecture pipeline works
          </h2>
        </motion.div>

        {/* Horizontal Flow */}
        <div className="w-full relative">
          {/* Connecting Line (Desktop only) */}
          <div className="hidden lg:block absolute top-[48px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-emerald-500/0 z-0" />
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10"
          >
            {steps.map((step, index) => (
              <motion.div 
                key={step.id}
                variants={stepVariants}
                className="flex flex-col relative group"
              >
                {/* Number & Icon Circle */}
                <div className="mb-6 flex flex-col items-center lg:items-start relative">
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${step.color} border ${step.borderColor} flex items-center justify-center mb-4 relative backdrop-blur-xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:shadow-purple-500/10`}>
                    {step.icon}
                    
                    {/* Step Number Badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#111111] border border-white/10 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {step.id}
                    </div>
                  </div>
                  
                  {/* Arrow for mobile/tablet (between rows) */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden text-white/20 mt-4">
                      <ArrowRight className="w-6 h-6 rotate-90 md:rotate-0 md:absolute md:top-1/2 md:-right-6 md:-translate-y-1/2" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="text-center lg:text-left bg-[#111111]/50 border border-white/5 rounded-2xl p-6 h-full backdrop-blur-sm hover:bg-[#1a1a1a]/80 transition-colors">
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <div className="text-xs font-mono text-purple-400 mb-4 tracking-wide">{step.tech}</div>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProcessFlow;
