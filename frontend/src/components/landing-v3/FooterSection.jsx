import React from 'react';
import { motion } from 'framer-motion';
import { Hexagon } from 'lucide-react';

const FooterSection = () => {
  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-white/10 py-20 px-6 relative overflow-hidden">
      {/* Opposite corner glows for section */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none translate-x-1/2 translate-y-1/2" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Newsletter / Brand */}
          <div className="md:col-span-5 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-4 -ml-2">
              <img src="/archreviewlogo.png" alt="ArchReview Logo" className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
              <span className="text-white font-bold text-xl tracking-tight">ArchReview</span>
            </div>
            
            <p className="text-white/60 text-sm mb-8 leading-relaxed max-w-sm">
              ArchReview – Automate Smarter, Optimize Faster, and Grow Stronger.
            </p>

            <div className="w-full max-w-sm">
              <label className="text-white/80 text-sm font-medium mb-3 block">Join our newsletter</label>
              <div className="flex gap-2 p-1.5 bg-[#111111] border border-white/10 rounded-xl">
                <input 
                  type="email" 
                  placeholder="name@email.com" 
                  className="bg-transparent border-0 ring-0 focus:ring-0 focus:outline-none text-sm px-3 flex-1 text-white placeholder-white/30"
                />
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Links Column */}
          <div className="md:col-span-2 md:col-start-7">
            <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-wider">Links</h4>
            <ul className="space-y-4">
              {['Services', 'Process', 'Case studies', 'Benefits', 'Pricing'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/50 hover:text-white transition-colors text-sm font-medium">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Pages Column */}
          <div className="md:col-span-2">
            <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-wider">Pages</h4>
            <ul className="space-y-4">
              {['Home', 'About', 'Blog', 'Contact', '404'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/50 hover:text-white transition-colors text-sm font-medium">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials Column */}
          <div className="md:col-span-2">
            <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-wider">Socials</h4>
            <ul className="space-y-4">
              {['Instagram', 'Facebook', 'LinkedIn', 'Twitter'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/50 hover:text-white transition-colors text-sm font-medium">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Separator / Copyright */}
        <div className="pt-8 border-t border-white/5 flex justify-center items-center text-xs text-white/30">
          <span>© 2026 ArchReview. All rights reserved.</span>
        </div>

      </div>
    </footer>
  );
};

export default FooterSection;
