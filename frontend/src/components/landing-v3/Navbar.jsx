import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="w-full bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 sticky top-0 z-50"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/archreviewlogo.png" alt="ArchReview Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
          <span className="text-white font-bold text-xl tracking-tight">ArchReview</span>
        </div>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Home</a>
          <a href="#features" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Features</a>
          <a href="#pricing" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Pricing</a>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Sign in</Link>
          <motion.button
            onClick={() => navigate('/register')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-purple-500/20"
          >
            Get started
          </motion.button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white/70 hover:text-white focus:outline-none p-2">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-[#111111] border-t border-white/10 mt-4 -mx-6 px-6 rounded-b-2xl shadow-2xl"
          >
            <div className="flex flex-col gap-4 py-6">
              <a href="#" onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors font-medium">Home</a>
              <a href="#features" onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors font-medium">Features</a>
              <a href="#pricing" onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors font-medium">Pricing</a>
              <div className="h-px bg-white/10 my-2" />
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors font-medium">Sign in</Link>
              <button onClick={() => { setIsOpen(false); navigate('/register'); }} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-lg font-medium transition-colors text-center shadow-lg shadow-purple-500/20 w-full mt-2">
                Get started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
