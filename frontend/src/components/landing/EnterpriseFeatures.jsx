import { motion } from 'framer-motion';
import {
  HardDrive,
  Search,
  Sparkles,
  Cpu,
  Database,
  ScanText,
  Settings,
  Binary,
} from 'lucide-react';

const technologies = [
  {
    name: 'Amazon S3',
    icon: HardDrive,
    description:
      'Secure document storage with encryption at rest and in transit',
    gradient: 'from-orange-400 to-amber-500',
    bgLight: 'bg-orange-50',
  },
  {
    name: 'Vector Search',
    icon: Search,
    description:
      'MongoDB Atlas Vector Search for semantic document matching',
    gradient: 'from-emerald-400 to-teal-500',
    bgLight: 'bg-emerald-50',
  },
  {
    name: 'Gemini 2.5',
    icon: Sparkles,
    description:
      'Google DeepMind advanced reasoning for architecture analysis',
    gradient: 'from-blue-400 to-indigo-500',
    bgLight: 'bg-blue-50',
  },
  {
    name: 'Groq Llama 3.3',
    icon: Cpu,
    description: 'Ultra-fast inference for real-time processing',
    gradient: 'from-violet-400 to-purple-500',
    bgLight: 'bg-violet-50',
  },
  {
    name: 'MongoDB Atlas',
    icon: Database,
    description:
      'Cloud-native database with vector search capabilities',
    gradient: 'from-green-400 to-emerald-500',
    bgLight: 'bg-green-50',
  },
  {
    name: 'OCR Engine',
    icon: ScanText,
    description:
      'Extract text and structure from architecture diagrams',
    gradient: 'from-cyan-400 to-sky-500',
    bgLight: 'bg-cyan-50',
  },
  {
    name: 'Rule Engine',
    icon: Settings,
    description:
      'Configurable rule sets for custom architecture standards',
    gradient: 'from-slate-400 to-gray-500',
    bgLight: 'bg-slate-100',
  },
  {
    name: 'BGE Embeddings',
    icon: Binary,
    description:
      'State-of-the-art text embeddings for semantic understanding',
    gradient: 'from-rose-400 to-pink-500',
    bgLight: 'bg-rose-50',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.07,
      ease: 'easeOut',
    },
  }),
};

export default function EnterpriseFeatures() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Enterprise-grade infrastructure
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Built on battle-tested cloud services and cutting-edge AI models.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {technologies.map((tech, i) => {
            const Icon = tech.icon;
            return (
              <motion.div
                key={tech.name}
                className="group bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-lg hover:border-slate-300/80 transition-all duration-300 cursor-default"
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                custom={i}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tech.gradient} flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1.5">
                  {tech.name}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {tech.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
