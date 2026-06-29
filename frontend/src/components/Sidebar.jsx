import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';
import { Button } from './ui/button';
import { 
  Layers, 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Search,
  FileText,
  MessageSquare,
  MoreVertical,
  Pin,
  Trash2
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [pinnedIds, setPinnedIds] = useState(() => {
    return JSON.parse(localStorage.getItem('archreview_pinned') || '[]');
  });

  useEffect(() => {
    fetchProjects();
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem('archreview_pinned', JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  const togglePin = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setPinnedIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
    setOpenMenuId(null);
  };

  const handleDeleteProject = async (e, projectId, projectName) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenuId(null);
    if (!window.confirm(`Are you sure you want to delete "${projectName}"? This will delete all attached documents, chats, and reviews. This action cannot be undone.`)) {
      return;
    }
    
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter(p => p._id !== projectId));
      if (location.pathname.includes(projectId)) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to delete project', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  // Close menu if user clicks outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.data.projects.slice(0, 5)); // Show top 5 projects
    } catch (e) {
      console.error(e);
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    const aPinned = pinnedIds.includes(a._id);
    const bPinned = pinnedIds.includes(b._id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'New Review',
      path: '/projects/new',
      icon: PlusCircle
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen bg-white border-r border-slate-200/80 transition-all duration-300 flex flex-col justify-between shrink-0 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 relative">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="shrink-0 flex items-center justify-center -ml-4 -my-4 relative z-10">
              <img src="/archreviewlogo.png" alt="ArchReview Logo" className="h-20 w-20 object-contain scale-110" />
            </div>
            {isOpen && (
              <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent truncate animate-in fade-in duration-300">
                ArchReview
              </span>
            )}
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(!isOpen)}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600"
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/5 text-primary border-l-4 border-primary' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                {isOpen && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Recent Projects Section (Only if open) */}
        {isOpen && projects.length > 0 && (
          <div className="px-6 py-2 space-y-2 animate-in fade-in duration-300">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Reviews</h4>
            <div className="space-y-1">
              {sortedProjects.map((p) => {
                const isActive = location.pathname.includes(p._id);
                const isPinned = pinnedIds.includes(p._id);
                return (
                  <div key={p._id} className="relative group/menu flex items-center justify-between px-2 py-1.5 rounded-lg transition-all hover:bg-slate-50">
                    <Link
                      to={`/projects/${p._id}`}
                      className={`flex items-center gap-2 text-[11px] font-semibold flex-1 truncate ${
                        isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {isPinned ? (
                        <Pin className="h-3.5 w-3.5 shrink-0 text-amber-500 fill-amber-500/20" />
                      ) : (
                        <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      )}
                      <span className="truncate">{p.name}</span>
                    </Link>
                    
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === p._id ? null : p._id);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 opacity-0 group-hover/menu:opacity-100 transition-opacity ml-1"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                    
                    {openMenuId === p._id && (
                      <div className="absolute right-0 top-7 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                        <button 
                          onClick={(e) => togglePin(e, p._id)}
                          className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                        >
                          <Pin className="h-3.5 w-3.5 text-slate-400" /> {isPinned ? 'Unpin Review' : 'Pin Review'}
                        </button>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <button 
                          onClick={(e) => handleDeleteProject(e, p._id, p.name)}
                          className="w-full text-left px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* User Profile & Actions Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between gap-3 overflow-hidden">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <span className="text-xs font-bold text-primary">
                {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            {isOpen && (
              <div className="text-left truncate animate-in fade-in duration-300">
                <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Architect'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          {isOpen && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 shrink-0"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
