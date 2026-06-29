import { useEffect } from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import TrustSection from './TrustSection';
import ComparisonSection from './ComparisonSection';
import ScoreAnalysis from './ScoreAnalysis';
import EnterpriseFeatures from './EnterpriseFeatures';
import FAQSection from './FAQSection';
import FinalCTA from './FinalCTA';

// Reuse the highly polished grid/timeline from v1 folder
import FeatureGrid from '../landing/FeatureGrid';
import HowItWorksSection from '../landing/HowItWorksSection';

export default function LandingDemoV2() {
  useEffect(() => {
    document.title = 'ArchReview AI — Enterprise Architecture Intelligence';
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden antialiased font-sans">
      <Navbar />

      <main>
        <section id="hero">
          <HeroSection />
        </section>

        <section id="trust">
          <TrustSection />
        </section>

        <section id="features">
          <FeatureGrid />
        </section>


        <section id="how-it-works">
          <HowItWorksSection />
        </section>

        <section id="comparison">
          <ComparisonSection />
        </section>

        <section id="scores">
          <ScoreAnalysis />
        </section>

        <section id="enterprise">
          <EnterpriseFeatures />
        </section>

        <section id="faq">
          <FAQSection />
        </section>

        <section id="cta">
          <FinalCTA />
        </section>
      </main>
      
      {/* Taste-Skill Premium Footer */}
      <footer className="bg-slate-950 text-slate-400 py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-20">
            <div className="md:col-span-2">
              <span className="font-bold tracking-tighter text-white text-xl mb-4 block">ArchReview AI</span>
              <p className="max-w-xs text-sm leading-relaxed text-slate-500">
                Enterprise architecture intelligence. We catch vulnerabilities and scaling bottlenecks before they reach production.
              </p>
            </div>
            
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-6">Product</h3>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="hover:text-white transition-colors">Architecture Review</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security Analysis</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Knowledge Base</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-6">Company</h3>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/10 text-xs text-slate-500">
            <span className="font-mono">&copy; 2025 ArchReview Systems Inc.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Security</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
