import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Search, Activity, BarChart3, Sparkles, User, LogOut, Shield, LayoutDashboard } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardLayout() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const syncUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('users')
          .upsert({ 
            id: user.id, 
            email: user.email, 
            name: user.user_metadata?.full_name || 'Neural Pioneer' 
          }, { onConflict: 'id' });
      }
    };
    syncUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // 1. Top Level Navigation (Strictly matching PRD)
  const topNavItems = [
    { 
      label: 'My Courses', 
      path: '/dashboard', 
      icon: <LayoutDashboard size={16} />,
      // Consider it active if we are on any of the Hub pages
      activePaths: ['/dashboard', '/dashboard/courses', '/dashboard/search', '/dashboard/tracker', '/dashboard/analytics'] 
    },
    { label: 'AI Tutor', path: '/dashboard/personalized', icon: <Sparkles size={16} /> },
    { label: 'Profile', path: '/dashboard/profile', icon: <User size={16} /> }
  ];

  if (isAdmin) {
    topNavItems.push({ label: 'Admin Panel', path: '/dashboard/admin', icon: <Shield size={16} /> });
  }

  // 2. Hub Sub-Navigation for "My Courses"
  const myCoursesSubNav = [
    { label: 'Dashboard Hub', path: '/dashboard', icon: <LayoutDashboard size={14} /> },
    { label: 'Courses', path: '/dashboard/courses', icon: <BookOpen size={14} /> },
    { label: 'Search', path: '/dashboard/search', icon: <Search size={14} /> },
    { label: 'Learning Tracker', path: '/dashboard/tracker', icon: <Activity size={14} /> },
    { label: 'Analytics Dashboard', path: '/dashboard/analytics', icon: <BarChart3 size={14} /> },
  ];

  const isMyCoursesHubActive = topNavItems[0].activePaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#050510] text-white relative flex flex-col overflow-hidden font-sans">
      {/* Immersive Background Effects for Dashboard */}
      <div className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[130px] mix-blend-screen pointer-events-none animate-pulse z-0"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full bg-accent/10 blur-[150px] mix-blend-screen pointer-events-none z-0"></div>

      {/* Premium Top Navigation Bar */}
      <header className="relative z-30 w-full bg-black/40 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <h1 
              onClick={() => navigate('/')} 
              className="text-2xl font-black tracking-tighter cursor-pointer hover:opacity-80 transition-all group"
            >
              NEURO<span className="text-accent group-hover:text-primary transition-colors">LEARN</span>
            </h1>

            {/* Main Nav Links (Clean and Minimal) */}
            <nav className="hidden lg:flex items-center gap-2">
              {topNavItems.map((item) => {
                const isActive = item.activePaths ? item.activePaths.includes(location.pathname) : location.pathname.startsWith(item.path);
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
                      isActive 
                      ? 'bg-white/10 text-white shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] border border-white/20' 
                      : 'text-white/40 hover:text-white hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    {item.icon && <span className={isActive ? 'text-primary' : ''}>{item.icon}</span>}
                    {item.label}
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-1 shadow-[0_0_10px_rgba(124,58,237,0.8)]"></div>}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/[0.03] rounded-2xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-black">
                  {user?.user_metadata?.full_name?.split(' ').map(n => n[0]).join('') || user?.email?.substring(0, 2).toUpperCase() || 'JD'}
                </div>
                <span className="text-xs font-bold text-white/60">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Neural Pioneer'}
                </span>
             </div>

             <button 
               onClick={handleLogout} 
               className="group p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-300"
               title="Sign Out"
             >
               <LogOut size={18} className="text-white/40 group-hover:text-red-400 transition-colors" />
             </button>
          </div>
        </div>
      </header>

      {/* Nested Sub-Navigation (Only visible in My Courses Hub) */}
      {isMyCoursesHubActive && (
        <div className="bg-black/20 backdrop-blur-md border-b border-white/5 shrink-0 z-20">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center overflow-x-auto custom-scrollbar">
            <nav className="flex items-center gap-1">
              {myCoursesSubNav.map((subItem) => {
                const isSubActive = location.pathname === subItem.path;
                return (
                  <button
                    key={subItem.path}
                    onClick={() => navigate(subItem.path)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${
                      isSubActive 
                      ? 'bg-primary/20 text-primary border border-primary/30' 
                      : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {subItem.icon}
                    {subItem.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-8 overflow-y-auto">
        <Outlet />
      </main>

      {/* Mobile Footer Nav (Matches Top Level) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full h-16 bg-black/80 backdrop-blur-2xl border-t border-white/10 z-50 flex items-center justify-around px-4">
          {topNavItems.map((item) => {
            const isActive = item.activePaths ? item.activePaths.includes(location.pathname) : location.pathname.startsWith(item.path);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary' : 'text-white/30'}`}
              >
                {item.icon}
                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
      </nav>
    </div>
  );
}
