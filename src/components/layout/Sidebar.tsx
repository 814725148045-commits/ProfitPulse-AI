import React from 'react';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Package, 
  ShoppingBag, 
  Sliders, 
  Sparkles, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  ShieldCheck, 
  X,
  HelpCircle
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  openLeaksCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  openLeaksCount,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'leaks',
      label: 'Profit Leaks',
      icon: AlertTriangle,
      badge: openLeaksCount,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
    },
    {
      id: 'orders',
      label: 'Orders & Refunds',
      icon: ShoppingBag,
    },
    {
      id: 'simulator',
      label: 'Recovery Simulator',
      icon: Sliders,
      badge: 'Sim',
      badgeColor: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
    },
    {
      id: 'copilot',
      label: 'AI Copilot',
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleItemClick = (id: NavigationTab) => {
    onNavigate(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0b0f19] text-slate-300 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => handleItemClick('overview')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20 shrink-0">
            P
          </div>
          {!isCollapsed && (
            <div className="leading-tight transition-opacity duration-150">
              <span className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                ProfitPulse <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">AI</span>
              </span>
              <p className="text-[10px] text-slate-400 truncate max-w-[155px]">
                Margin Discovery & Defense
              </p>
            </div>
          )}
        </div>

        {/* Mobile close */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className={`px-2 pb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 ${isCollapsed ? 'hidden' : 'block'}`}>
          Analytics & Audits
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 group cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
              
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between text-left">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Tagline & Collapse toggle */}
      <div className="p-3 border-t border-slate-800/80">
        {!isCollapsed && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
              <span>Profit Guard Active</span>
            </div>
            <p className="text-[11px] text-slate-400 italic leading-snug">
              “Find the profit you're losing. Understand why. Fix it before it happens again.”
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="text-[10px] text-slate-400 font-mono">
              v1.4.0 • FastAPI Ready
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition ml-auto cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 transition-all duration-200 shrink-0 border-r border-slate-800 z-40 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
