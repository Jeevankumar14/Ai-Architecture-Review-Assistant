import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from './Sidebar';
import { Button } from './ui/button';
import { Menu, Settings, Bell, HelpCircle } from 'lucide-react';

export default function Layout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Collapsible Sidebar (Desktop) */}
      <div className="hidden md:block">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      </div>

      {/* Slide-out Sidebar (Mobile Overlay) */}
      {mobileOpen && (
        <div className="relative z-50 md:hidden animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl">
            <Sidebar isOpen={true} setIsOpen={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 min-h-screen ${
        sidebarOpen ? 'md:pl-64' : 'md:pl-20'
      }`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileOpen(!mobileOpen)} 
              className="md:hidden"
            >
              <Menu className="h-5 w-5 text-slate-500" />
            </Button>
            <div className="md:hidden flex items-center justify-center -ml-2">
              <img src="/archreviewlogo.png" alt="ArchReview" className="h-12 w-12 object-contain scale-125" />
            </div>
            <div className="text-xs font-semibold text-slate-400 select-none hidden sm:block">
              ArchReview Console
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100" title="Help">
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100" title="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100" title="System settings">
              <Settings className="h-4 w-4" />
            </Button>
            <div className="h-8 w-px bg-slate-200 mx-1" />
            <div className="text-xs font-bold text-slate-700 max-w-[120px] truncate hidden sm:block">
              {user.name || user.email}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
