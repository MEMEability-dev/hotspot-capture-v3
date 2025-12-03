import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, PenTool, Settings, Activity } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: '热点看板' },
    // Points to the new Copy List page instead of direct editor
    { to: '/copy-list', icon: PenTool, label: '文案编辑' },
    { to: '/config', icon: Settings, label: '配置中心' },
  ];

  // Custom active logic to handle sub-routes like /analysis/:id highlighting the dashboard
  const isItemActive = (to: string) => {
    if (to === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/analysis');
    }
    if (to === '/copy-list') {
      // Highlight "Copy Editing" when on list page OR inside the workbench editor
      return location.pathname.startsWith('/copy-list') || location.pathname.startsWith('/workbench');
    }
    return location.pathname.startsWith(to);
  };

  return (
    <div className="w-48 h-screen bg-white border-r border-slate-200 fixed left-0 top-0 flex flex-col z-50">
      <div className="h-16 flex items-center justify-center border-b border-slate-100">
        <div className="flex items-center gap-2 text-brand font-bold text-base">
          <Activity className="w-5 h-5" />
          <span>指数热点捕捉</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2">
        {navItems.map((item) => {
          const active = isItemActive(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors font-medium text-sm ${
                active
                  ? 'bg-brand text-white shadow-md shadow-brand/20'
                  : 'text-slate-600 hover:bg-brand-light hover:text-brand'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-brand-light rounded-lg p-3">
          <p className="text-[10px] text-brand-dark font-semibold mb-1">系统状态</p>
          <div className="flex items-center gap-2 text-[10px] text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            实时监控中
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;