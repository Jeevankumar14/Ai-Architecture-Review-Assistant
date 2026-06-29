import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What document types are supported?',
    answer:
      'We support PDF, DOCX, TXT, JSON, YAML, and image files (PNG, JPG for architecture diagrams). Our OCR engine can extract text from scanned documents and diagrams for comprehensive analysis.',
  },
  {
    question: 'How is my data secured?',
    answer:
      'All documents are encrypted at rest using AES-256 and in transit using TLS 1.3. Files are stored in isolated Amazon S3 buckets with strict access controls. We never share your data with third parties.',
  },
  {
    question: 'What about data privacy?',
    answer:
      'Your architecture documents are processed in isolated environments and never used for model training. Data is automatically purged after your configured retention period. We are SOC 2 Type II compliant.',
  },
  {
    question: 'Which AI models are used?',
    answer:
      'We use Google Gemini 2.5 Flash for deep architecture reasoning and Groq-hosted Llama 3.3 70B for fast inference. BGE-large-en-v1.5 embeddings power our vector search for semantic document matching.',
  },
  {
    question: 'Can this be deployed on-premise?',
    answer:
      'Yes. Our Enterprise plan supports on-premise deployment with custom model routing, private vector search instances, and dedicated infrastructure. Contact our sales team for details.',
  },
  {
    question: 'Is there a cloud-hosted option?',
    answer:
      'Absolutely. Our cloud-hosted platform runs on AWS with multi-region availability, automatic scaling, and 99.9% uptime SLA for Enterprise customers.',
  },
  {
    question: 'What pricing plans are available?',
    answer:
      'We offer a free Developer tier with 3 projects, a Team Pro plan at $79/month with unlimited projects, and custom Enterprise pricing. All plans include the full AI analysis pipeline.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="py-24 sm:py-32 bg-[#FAFBFC]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about AI Architecture Review Assistant.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                className={`bg-white rounded-xl border overflow-hidden transition-colors duration-200 ${
                  isOpen
                    ? 'border-blue-200 shadow-sm'
                    : 'border-slate-200/60 hover:border-slate-300/80'
                }`}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.06,
                  ease: 'easeOut',
                }}
              >
                <button
                  onClick={() => toggle(index)}
                  className={`w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer transition-colors duration-150 ${
                    isOpen ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {isOpen && (
                      <div className="w-1 h-6 bg-blue-500 rounded-full shrink-0" />
                    )}
                    <span
                      className={`text-sm font-semibold transition-colors duration-150 ${
                        isOpen ? 'text-blue-700' : 'text-slate-800'
                      }`}
                    >
                      {faq.question}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="shrink-0"
                  >
                    <ChevronDown
                      className={`w-5 h-5 transition-colors duration-150 ${
                        isOpen ? 'text-blue-500' : 'text-slate-400'
                      }`}
                    />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: { duration: 0.3, ease: 'easeInOut' },
                        opacity: { duration: 0.2, delay: 0.05 },
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-0">
                        <div className="pl-5 border-l-2 border-blue-100">
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
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
}
