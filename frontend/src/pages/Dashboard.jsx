import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Layers, 
  Plus, 
  ArrowRight, 
  Clock, 
  FileText, 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  Sparkles, 
  Search, 
  SlidersHorizontal,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  Award,
  Trash2
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ avgScore: 0, criticalRisks: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      const fetchedProjects = data.data.projects;
      setProjects(fetchedProjects);
      
      // Fetch latest reviews for stats
      const reviewPromises = fetchedProjects.map(p => 
        api.get(`/projects/${p._id}/reviews/latest`).catch(() => null)
      );
      
      if (reviewPromises.length > 0) {
        const reviewResponses = await Promise.all(reviewPromises);
        let totalScore = 0;
        let validScoreCount = 0;
        let criticalCount = 0;
        
        reviewResponses.forEach(res => {
          const rev = res?.data?.data?.review;
          if (rev && rev.scores?.overall?.score) {
            totalScore += rev.scores.overall.score;
            validScoreCount++;
          }
          if (rev && rev.findings) {
            criticalCount += rev.findings.filter(f => f.severity && f.severity.toLowerCase() === 'critical').length;
          }
        });
        
        setStats({
          avgScore: validScoreCount ? Math.round(totalScore / validScoreCount) : 0,
          criticalRisks: criticalCount
        });
      }
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (!window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await api.delete(`/projects/${projectId}`);
      // Remove deleted project from state
      setProjects(projects.filter(p => p._id !== projectId));
    } catch (error) {
      console.error('Failed to delete project', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Calculate high-level stats from projects
  const totalProjects = projects.length;
  const totalDocs = projects.reduce((sum, p) => sum + (p.documentCount || 0), 0);
  const avgScore = stats.avgScore;
  const criticalRisks = stats.criticalRisks;

  const getScoreColorClass = (score) => {
    if (score >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 75) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-r from-primary/5 via-purple-500/5 to-transparent p-8 md:p-10 shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Solutions Architect Copilot Active</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              Welcome Back, {user?.name ? user.name.split(' ')[0] : 'Architect'}
            </h1>
            <p className="text-slate-600 font-medium text-sm md:text-base max-w-xl">
              You have scanned {totalDocs} documents across {totalProjects} projects. Secure, scale, and optimize your designs below.
            </p>
          </div>
          <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold" asChild>
            <Link to="/projects/new">
              <Plus className="mr-2 h-5 w-5" /> New Review Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Average Architecture Score',
            value: totalProjects > 0 ? `${avgScore}/100` : 'N/A',
            desc: 'AWS Well-Architected Framework',
            icon: Award,
            color: 'text-primary bg-primary/10 border-primary/20',
          },
          {
            title: 'Total Scanned Projects',
            value: totalProjects,
            desc: 'Active system boundaries',
            icon: Layers,
            color: 'text-blue-600 bg-blue-50 border-blue-100',
          },
          {
            title: 'Ingested Design Docs',
            value: totalDocs,
            desc: 'PDF, Word, API, YAML schemas',
            icon: FileText,
            color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
          },
          {
            title: 'Critical Risks Detected',
            value: criticalRisks,
            desc: 'Require immediate remediation',
            icon: ShieldAlert,
            color: criticalRisks > 0 ? 'text-rose-600 bg-rose-50 border-rose-100' : 'text-slate-500 bg-slate-50 border-slate-100',
          }
        ].map((stat) => (
          <Card key={stat.title} className="shadow-sm hover:shadow-md transition-all border-slate-200/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.title}</span>
              <div className={`p-2 rounded-lg border ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900">{stat.value}</div>
              <p className="text-xs text-slate-500 mt-1 font-semibold">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid: Projects & Quick Chat widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Projects Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">Your Systems Architecture</h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Manage and review your architecture scopes</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-primary shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="rounded-xl border-slate-200 shadow-sm shrink-0">
                <SlidersHorizontal className="h-4 w-4 text-slate-500" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <Card className="border-dashed border-slate-300">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <Layers className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">No projects found</h3>
                  <p className="text-slate-500 max-w-sm mb-6 text-xs leading-relaxed font-semibold">
                    Get started by creating a new architecture review project and uploading your system design documents.
                  </p>
                  <Button asChild>
                    <Link to="/projects/new">Create Project</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredProjects.map((project) => (
                <div 
                  key={project._id} 
                  className="group relative border border-slate-200/80 hover:border-slate-300 bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-extrabold text-base text-slate-800 group-hover:text-primary transition-colors line-clamp-1">
                        {project.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed max-w-xl">
                      {project.description || 'No description provided for this design scope.'}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        {project.documentCount} Documents
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        Updated {new Date(project.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-row gap-2 shrink-0 md:self-center">

                    <Button variant="outline" size="sm" className="rounded-xl border-slate-200 shadow-sm text-xs font-bold" asChild>
                      <Link to={`/projects/${project._id}/chat`}>
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5 text-primary" /> Chat QA
                      </Link>
                    </Button>
                    <Button size="sm" className="rounded-xl text-xs font-bold shadow-sm" asChild>
                      <Link to={`/projects/${project._id}`}>
                        View Details <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Floating Quick Copilot Panel */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">ArchReview Copilot</h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Quick Solutions Architect suggestions</p>
          </div>
          
          <Card className="border-slate-200/80 shadow-sm bg-gradient-to-b from-white to-slate-50/50">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800">Active Recommendations</CardTitle>
                  <CardDescription className="text-[10px] font-semibold text-slate-500">Based on recent architecture rules</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex items-start gap-2.5 p-3 rounded-xl border border-red-100 bg-red-50/30">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-slate-800 font-bold block">Security Audit Alert</span>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Plaintext Stripe secrets detected in E-Commerce microservices env file config. Enable KMS masking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-100 bg-amber-50/30">
                <Activity className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-slate-800 font-bold block">Availability Alert</span>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    RDS ledger DB is configured for Single-AZ. Transition to Multi-AZ replication to avoid downtime.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardContent className="pt-0 border-t border-slate-100 mt-4 p-4">
              <Button className="w-full text-xs font-bold py-5 rounded-xl border-slate-200 shadow-sm" variant="outline" onClick={() => navigate(projects.length > 0 ? `/projects/${projects[0]._id}/chat` : '/projects/new')}>
                Ask Copilot for Action Steps
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
