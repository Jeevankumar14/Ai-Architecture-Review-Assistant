import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const scores = [
  {
    title: 'Overall Score',
    score: 89,
    color: '#2563EB',
    bgLight: 'bg-blue-50',
    description: 'Comprehensive architecture health',
  },
  {
    title: 'Security',
    score: 92,
    color: '#10B981',
    bgLight: 'bg-emerald-50',
    description: 'Threat modeling and access control',
  },
  {
    title: 'Scalability',
    score: 91,
    color: '#8B5CF6',
    bgLight: 'bg-violet-50',
    description: 'Horizontal and vertical scaling readiness',
  },
  {
    title: 'Performance',
    score: 87,
    color: '#F59E0B',
    bgLight: 'bg-amber-50',
    description: 'Response times and resource efficiency',
  },
  {
    title: 'Cost Optimization',
    score: 85,
    color: '#06B6D4',
    bgLight: 'bg-cyan-50',
    description: 'Cloud spend and resource utilization',
  },
  {
    title: 'Maintainability',
    score: 88,
    color: '#F43F5E',
    bgLight: 'bg-rose-50',
    description: 'Code quality and operational readiness',
  },
];

const RADIUS = 50;
const STROKE_WIDTH = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const VIEW_BOX_SIZE = (RADIUS + STROKE_WIDTH) * 2;
const CENTER = RADIUS + STROKE_WIDTH;

function CircularProgress({ score, color, isInView }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let frame;
    const duration = 1200;
    const start = performance.now();

    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, score]);

  const offset = isInView
    ? CIRCUMFERENCE * (1 - score / 100)
    : CIRCUMFERENCE;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={VIEW_BOX_SIZE}
        height={VIEW_BOX_SIZE}
        viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth={STROKE_WIDTH}
        />
        {/* Progress circle */}
        <motion.circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
        />
      </svg>
      {/* Score number centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-2xl font-bold tracking-tight"
          style={{ color }}
        >
          {displayScore}
        </span>
      </div>
    </div>
  );
}

function ScoreCard({ item, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className="bg-white rounded-2xl border border-slate-200/60 p-8 flex flex-col items-center text-center hover:shadow-lg hover:border-slate-300/60 transition-all duration-300"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
    >
      <CircularProgress
        score={item.score}
        color={item.color}
        isInView={isInView}
      />
      <h3 className="mt-5 text-base font-semibold text-slate-800">
        {item.title}
      </h3>
      <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
        {item.description}
      </p>
    </motion.div>
  );
}

export default function ScoreAnalysis() {
  return (
    <section className="py-24 sm:py-32 bg-[#FAFBFC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Architecture analysis that speaks for itself
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Every review generates detailed scores with animated visualizations
            across 6 key dimensions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {scores.map((item, i) => (
            <ScoreCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
