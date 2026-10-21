import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  Search, 
  Bell, 
  ChevronDown, 
  Check, 
  Sparkles, 
  Menu, 
  Server, 
  User, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { DateRange, NavigationTab } from '../../types';
import { SAMPLE_ORGANIZATION } from '../../data/sampleData';

interface TopHeaderProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onToggleMobileSidebar: () => void;
  openLeaksCount: number;
  isBackendConnected?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onNavigate,
  dateRange,
  onDateRangeChange,
  onOpenSearch,
  onOpenNotifications,
  onToggleMobileSidebar,
  openLeaksCount,
  isBackendConnected = false,
}) => {
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const dateOptions: { label: string; value: DateRange }[] = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days (Standard)', value: '30d' },
    { label: 'Last 90 Days (Q3)', value: '90d' },
    { label: 'Last 12 Months', value: '12m' },
    { label: 'FY 2025-26 YTD', value: 'ytd' },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile hamburger + Org selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Organization switcher */}
        <div className="relative">
          <button
            onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition text-left cursor-pointer group"
          >
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              A
            </div>
            <div className="hidden sm:block">
              <div className="font-semibold text-slate-900 text-xs flex items-center gap-1 group-hover:text-blue-600">
                {SAMPLE_ORGANIZATION.name}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition" />
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {SAMPLE_ORGANIZATION.gstin} • INR (₹)
              </div>
            </div>
          </button>

          {isOrgDropdownOpen && (
            <div 
              className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in zoom-in-95"
              onMouseLeave={() => setIsOrgDropdownOpen(false)}
            >
              <div className="px-2 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Select Workspace
              </div>
              <div className="p-2 bg-blue-50/80 rounded-lg border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-blue-900">{SAMPLE_ORGANIZATION.name}</div>
                  <div className="text-[10px] text-blue-700">Production • Shopify Plus + Amazon</div>
                </div>
                <Check className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsOrgDropdownOpen(false);
                    onNavigate('settings');
                  }}
                  className="w-full text-left px-2 py-1.5 text-slate-600 hover:bg-slate-100 rounded text-[11px] font-medium flex items-center justify-between"
                >
                  Manage Organizations
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Search bar trigger */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100/90 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-xl transition text-xs shadow-2xs group cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
            <span className="text-slate-500 font-normal">Search profit leaks, orders, SKUs...</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 text-slate-500 rounded">
              ⌘K
            </kbd>
          </span>
        </button>
      </div>

      {/* Right: Date Range Selector + Notifications + Backend Badge + User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date range filter */}
        <div className="relative">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1 shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value as DateRange)}
              aria-label="Select reporting date range"
              className="bg-transparent text-slate-700 font-semibold py-1 pr-2 text-xs focus:outline-hidden cursor-pointer"
            >
              {dateOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search trigger icon for mobile */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          aria-label="Open search dialog"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          aria-label="Open notifications"
          title="Notifications & Activity"
        >
          <Bell className="w-4 h-4" />
          {openLeaksCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          )}
        </button>

        {/* Backend status indicator */}
        <button
          onClick={() => onNavigate('settings')}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition cursor-pointer"
          title={isBackendConnected ? 'Connected to FastAPI' : 'Operating in Verified Demo Mode (FastAPI fallback)'}
        >
          <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
          <span>{isBackendConnected ? 'FastAPI Live' : 'Demo Mode'}</span>
        </button>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100">
              RS
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isUserDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in zoom-in-95"
              onMouseLeave={() => setIsUserDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="font-semibold text-slate-900">Rithin RS</div>
                <div className="text-[11px] text-slate-500 truncate">rsrithinrs@gmail.com</div>
                <span className="inline-block mt-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded">
                  Admin (All Access)
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    onNavigate('settings');
                  }}
                  className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-100 rounded text-xs flex items-center gap-2"
                >
                  <Server className="w-3.5 h-3.5 text-slate-400" />
                  API & Backend Settings
                </button>
                <button
                  onClick={() => {
                    setIsUserDropdownOpen(false);
                    onNavigate('copilot');
                  }}
                  className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-100 rounded text-xs flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  AI Profit Advisor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
