import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

function smoothScroll(e, href) {
  if (href.startsWith('#')) {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-600/20">
            <Layers className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-lg font-bold text-transparent">
            ArchReview AI
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => smoothScroll(e, link.href)}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100/80 hover:text-slate-900"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop right actions */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link
              to="/dashboard"
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    smoothScroll(e, link.href);
                    setMobileOpen(false);
                  }}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  {link.label}
                </a>
              ))}

              <div className="mt-3 border-t border-slate-100 pt-3">
                {user ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-blue-600/20"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="mt-2 block w-full rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-blue-600/20"
                    >
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
