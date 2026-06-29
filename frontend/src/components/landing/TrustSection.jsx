import { motion } from 'framer-motion';

const businesses = [
  'Google',
  'Microsoft',
  'Amazon',
  'Meta',
  'Netflix',
  'Stripe'
];

export default function TrustSection() {
  return (
    <section className="bg-[#FAFBFC] py-10 border-b border-slate-200/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-slate-500 mb-8">
          Trusted by engineering teams at
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {businesses.map((business, index) => (
            <motion.div
              key={business}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 flex items-center justify-center min-w-[120px]"
            >
              {business}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
