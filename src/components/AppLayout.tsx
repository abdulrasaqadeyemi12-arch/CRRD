import React from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Database, 
  AlertTriangle, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { logout } from '../lib/firebase.ts';
import { cn } from '../lib/utils.ts';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  key?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full px-4 py-3 mb-1 text-sm font-medium transition-all duration-200 rounded-lg group",
      active 
        ? "bg-slate-900 text-white shadow-lg shadow-slate-200/50" 
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    <Icon className={cn("w-5 h-5 mr-3 shrink-0", active ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
    <span>{label}</span>
    {active && <ChevronRight className="w-4 h-4 ml-auto" />}
  </button>
);

export const AppLayout: React.FC<{ 
  children: React.ReactNode; 
  activeView: string;
  onViewChange: (view: string) => void;
}> = ({ children, activeView, onViewChange }) => {
  const { user, userProfile, organization } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assets', label: 'Asset Management', icon: Database },
    { id: 'risks', label: 'Risk Register', icon: AlertTriangle },
    { id: 'remediation', label: 'Remediation', icon: CheckSquare },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center mb-6">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center mr-3 shrink-0 shadow-xl shadow-slate-200">
            <Shield className="w-6 h-6 text-white" />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-xl tracking-tight text-slate-900">CRRD</span>
          )}
        </div>

        <nav className="flex-1 px-4 overflow-y-auto">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={isSidebarOpen ? item.label : ""}
              active={activeView === item.id}
              onClick={() => onViewChange(item.id)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center px-2 py-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-3 shrink-0 overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-slate-500 uppercase">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
                </span>
              )}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-slate-900">{user?.displayName || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{organization?.name || 'Organization'}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className={cn(
              "flex items-center w-full px-4 py-2 mt-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors",
              !isSidebarOpen && "justify-center px-0"
            )}
          >
            <LogOut className="w-5 h-5 mr-3 shrink-0" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg mr-4 text-slate-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900 capitalize">
              {menuItems.find(i => i.id === activeView)?.label}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="px-3 py-1 bg-slate-100 rounded-full flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-slate-600">Platform Secure</span>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
