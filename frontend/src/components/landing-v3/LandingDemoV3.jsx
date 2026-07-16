import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import LogoWall from './LogoWall';
import ServicesBento from './ServicesBento';
import ProcessFlow from './ProcessFlow';
import BenefitsGrid from './BenefitsGrid';
import Testimonials from './Testimonials';
import FAQSection from './FAQSection';
import FinalCTA from './FinalCTA';
import FooterSection from './FooterSection';

const LandingDemoV3 = () => {
  return (
    <main className="bg-[#0a0a0a] min-h-[100dvh] text-white font-sans antialiased selection:bg-purple-500/30">
      <Navbar />
      <HeroSection />
      <LogoWall />
      <ServicesBento />
      <section id="how-it-works">
        <ProcessFlow />
      </section>
      <BenefitsGrid />
      <Testimonials />
      <FAQSection />
      <FinalCTA />
      <FooterSection />
    </main>
  );
};

export default LandingDemoV3;
