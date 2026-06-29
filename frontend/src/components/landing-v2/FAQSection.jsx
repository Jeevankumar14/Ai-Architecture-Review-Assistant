import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-slate-200">
      <button 
        className="w-full py-8 flex justify-between items-center text-left group"
        onClick={onClick}
      >
        <h3 className="text-xl font-medium text-slate-900 pr-8">{question}</h3>
        <span className="text-slate-400 group-hover:text-slate-900 transition-colors shrink-0">
          {isOpen ? <Minus strokeWidth={1.5} className="w-6 h-6" /> : <Plus strokeWidth={1.5} className="w-6 h-6" />}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-8 text-lg font-light text-slate-500 pr-12 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "How does it understand our custom architecture?",
      answer: "We use a combination of vector search and specialized LLMs (like Gemini and Llama) to map your codebase against established architectural patterns and your own internal documentation."
    },
    {
      question: "Is our source code secure?",
      answer: "Absolutely. We don't train models on your code. Processing happens in isolated, ephemeral containers, and data is encrypted at rest using enterprise-grade standards."
    },
    {
      question: "Can it review cloud infrastructure (Terraform/AWS)?",
      answer: "Yes, ArchReview AI natively parses Infrastructure as Code (IaC) files, AWS CloudFormation, and Terraform to evaluate your actual deployed environment, not just application logic."
    },
    {
      question: "How long does a review take?",
      answer: "A standard repository takes about 45 seconds to analyze, compared to weeks of manual meetings. The results are deterministic and immediately available."
    }
  ];

  return (
    <section className="py-32 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-light tracking-tight text-slate-900 mb-16">Common questions.</h2>
        
        <div className="flex flex-col">
          {faqs.map((faq, idx) => (
            <FAQItem 
              key={idx}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === idx}
              onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
