import { Layers, Globe, Terminal, Shield } from 'lucide-react';

const productLinks = [
  { label: 'Architecture Review', href: '#' },
  { label: 'Scoring Engine', href: '#' },
  { label: 'AI Chat', href: '#' },
  { label: 'Knowledge Base', href: '#' },
  { label: 'Integrations', href: '#' },
];

const resourceLinks = [
  { label: 'Documentation', href: '#' },
  { label: 'API Reference', href: '#' },
  { label: 'Architecture Templates', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'System Status', href: '#' },
];

const companyLinks = [
  { label: 'About Us', href: '#' },
  { label: 'Security & Compliance', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Contact', href: '#' },
];


function FooterLinkColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-sm text-slate-500 transition-colors duration-200 hover:text-blue-600"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-16 text-slate-600 text-xs">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-100">
          
          {/* Column 1: Brand */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <Layers className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-sm text-slate-800 tracking-tight">ArchReview AI</span>
            </div>
            <p className="text-slate-500 leading-relaxed font-medium">
              Enterprise AI platform for automated software architecture reviews. Analyze SRS, HLD, API specs, and more with AI-powered intelligence.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-colors text-slate-500 hover:text-blue-600">
                <Globe className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-colors text-slate-500 hover:text-blue-600">
                <Terminal className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-colors text-slate-500 hover:text-blue-600">
                <Shield className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-8">
            <FooterLinkColumn title="Product" links={productLinks} />
            <FooterLinkColumn title="Resources" links={resourceLinks} />
            <FooterLinkColumn title="Company" links={companyLinks} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 py-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            &copy; 2025 ArchReview AI. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-xs text-slate-500 transition-colors duration-200 hover:text-blue-600"
            >
              Security
            </a>
            <a
              href="#"
              className="text-xs text-slate-500 transition-colors duration-200 hover:text-blue-600"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-xs text-slate-500 transition-colors duration-200 hover:text-blue-600"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
