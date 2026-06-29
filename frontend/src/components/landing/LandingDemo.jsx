import { useEffect } from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import TrustSection from './TrustSection';
import HowItWorksSection from './HowItWorksSection';
import FeatureGrid from './FeatureGrid';
import DashboardShowcase from './DashboardShowcase';
import ComparisonSection from './ComparisonSection';
import ScoreAnalysis from './ScoreAnalysis';
import EnterpriseFeatures from './EnterpriseFeatures';
import FAQSection from './FAQSection';
import FinalCTA from './FinalCTA';
import Footer from './Footer';
import './landing.css';

export default function LandingDemo() {
  useEffect(() => {
    document.title = 'ArchReview AI — AI-Powered Architecture Intelligence Platform';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Automatically review software architecture documents with AI. Get comprehensive scores across security, performance, scalability, cost, and maintainability in minutes.');
    }
  }, []);

  return (
    <div className="landing-root landing-noise min-h-screen bg-[#FAFBFC] text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden antialiased">
      {/* Background decorative blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="landing-blob absolute -top-32 left-[15%] w-[600px] h-[600px] bg-blue-500/[0.03] rounded-full blur-3xl" />
        <div className="landing-blob-delayed absolute top-[30%] right-[10%] w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-3xl" />
        <div className="landing-blob-slow absolute top-[60%] left-[5%] w-[400px] h-[400px] bg-sky-500/[0.03] rounded-full blur-3xl" />
      </div>

      {/* Subtle grid pattern */}
      <div className="fixed inset-0 landing-grid-bg pointer-events-none z-0" aria-hidden="true" />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-1">
        {/* 1. Hero */}
        <section id="hero">
          <HeroSection />
        </section>

        {/* 2. Trust / Built For */}
        <section id="trust" className="landing-section">
          <TrustSection />
        </section>

        {/* 3. How It Works */}
        <section id="how-it-works" className="landing-section">
          <HowItWorksSection />
        </section>

        {/* 4. Feature Grid (Bento) */}
        <section id="features" className="landing-section">
          <FeatureGrid />
        </section>

        {/* 5. Dashboard Showcase */}
        <section id="dashboard" className="landing-section">
          <DashboardShowcase />
        </section>

        {/* 6. Why Different (Comparison) */}
        <section id="comparison" className="landing-section">
          <ComparisonSection />
        </section>

        {/* 7. Architecture Analysis (Scores) */}
        <section id="scores" className="landing-section">
          <ScoreAnalysis />
        </section>

        {/* 8. Enterprise Features (Tech Stack) */}
        <section id="enterprise" className="landing-section">
          <EnterpriseFeatures />
        </section>

        {/* 9. FAQ */}
        <section id="faq" className="landing-section">
          <FAQSection />
        </section>

        {/* 10. Final CTA */}
        <section id="cta" className="landing-section">
          <FinalCTA />
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
