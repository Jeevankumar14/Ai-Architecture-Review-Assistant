import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import LogoWall from './LogoWall';
import ServicesBento from './ServicesBento';
import ProcessFlow from './ProcessFlow';
import BenefitsGrid from './BenefitsGrid';
import PricingSection from './PricingSection';
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
      <ProcessFlow />
      <BenefitsGrid />
      <PricingSection />
      <Testimonials />
      <FAQSection />
      <FinalCTA />
      <FooterSection />
    </main>
  );
};

export default LandingDemoV3;
