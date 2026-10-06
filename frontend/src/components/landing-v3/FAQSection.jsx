import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: "What architecture file formats do you support?",
    answer: "We support PDF, DOCX, TXT, JSON, YAML, and architecture diagram images. Our OCR engine and parsers extract text and structure for comprehensive analysis."
  },
  {
    question: "How is the architecture score calculated?",
    answer: "The score is evaluated across 5 key pillars: Security, Scalability, Performance, Cost, and Maintainability (plus overall health score). It is strictly grounded in deterministic rules, the AWS Well-Architected Framework, and OWASP standards."
  },
  {
    question: "Is my architecture data secure?",
    answer: "Absolutely. All uploaded documents are stored in Amazon S3 and processed in isolated environments. When you delete a review or project, all uploaded files, vector embeddings, and chat histories are permanently purged to eliminate storage waste."
  },
  {
    question: "Can I integrate this with my CI/CD pipeline?",
    answer: "Yes, our enterprise plan includes API access and webhook integrations, allowing you to automatically trigger architecture reviews on every major pull request or infrastructure change."
  },
  {
    question: "What AI models power the analysis?",
    answer: "We use a hybrid dual-path architecture combining deterministic rule verification, Google Gemini 2.5 Flash for rapid review generation, Cohere v4.0 (1024-d) embeddings in MongoDB Atlas Vector Search, and OpenRouter Llama 3.3 70B with Cohere reranking for cited interactive chat."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="w-full bg-[#0a0a0a] py-24 px-6 border-t border-white/5">
      <div className="max-w-3xl mx-auto flex flex-col">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-[#111111] border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <span className="text-purple-400 text-sm font-medium">FAQ</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${isOpen ? 'bg-[#111111] border-purple-500/30' : 'bg-[#0a0a0a] border-white/10 hover:border-white/20'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                >
                  <span className="font-semibold text-lg text-white pr-8">{faq.question}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/50'}`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-white/60 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
