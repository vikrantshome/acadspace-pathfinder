import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PieChart, ShieldAlert, LogOut, ChevronLeft } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navItems = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Careers', path: '/admin/careers', icon: Users },
    { name: 'Analytics', path: '/admin/analytics', icon: PieChart },
    { name: 'Audit Logs', path: '/admin/audit', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Sidebar - Fixed to screen height */}
      <aside className="w-full md:w-48 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-full z-10">
        <div className="h-16 flex items-center px-4 border-b border-gray-200 shrink-0">
          <span className="text-lg font-bold text-primary truncate">Naviksha Admin</span>
        </div>
        
        <div className="p-3 flex-grow overflow-y-auto">
          <div className="mb-6 px-2">
            <p className="text-xs font-medium text-gray-500">Welcome,</p>
            <p className="text-sm font-semibold truncate">{user?.name || user?.email}</p>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-gray-200 bg-white shrink-0 mt-auto">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={signOut}>
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="truncate">Sign Out</span>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 mt-2" asChild>
            <Link to="/">
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span className="truncate">App</span>
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 w-full h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
