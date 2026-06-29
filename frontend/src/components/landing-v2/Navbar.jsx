import React from 'react';
import { Layers } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/50 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center transition-transform group-hover:scale-105">
            <Layers className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">ArchReview</span>
        </div>

        {/* Links (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Engine', 'Pricing', 'Docs'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <a 
            href="#login" 
            className="hidden md:block text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign in
          </a>
          <button className="h-9 px-4 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
            Get Started
          </button>
        </div>
        
      </div>
    </nav>
  );
};

export default Navbar;
