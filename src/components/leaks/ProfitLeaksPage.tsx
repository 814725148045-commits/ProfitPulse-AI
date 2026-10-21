import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  Clock, 
  Check, 
  Ban, 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  Package, 
  Calendar, 
  TrendingDown, 
  ArrowRight,
  Info
} from 'lucide-react';
import { ProfitLeak, SeverityLevel, LeakCategory, LeakStatus, NavigationTab } from '../../types';
import { formatINR } from '../../utils/financialCalculations';

interface ProfitLeaksPageProps {
  leaks: ProfitLeak[];
  onUpdateStatus: (leakId: string, status: LeakStatus, note?: string) => void;
  selectedLeakId?: string | null;
  onClearSelectedLeak?: () => void;
  onNavigateToSimulator?: () => void;
  onNavigateToProducts?: (productName: string) => void;
}

export const ProfitLeaksPage: React.FC<ProfitLeaksPageProps> = ({
  leaks,
  onUpdateStatus,
  selectedLeakId,
  onClearSelectedLeak,
  onNavigateToSimulator,
  onNavigateToProducts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'impact' | 'severity' | 'date'>('impact');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  // Slide-over detail panel state
  const [activeLeak, setActiveLeak] = useState<ProfitLeak | null>(() => {
    if (selectedLeakId) {
      return leaks.find((l) => l.id === selectedLeakId) || null;
    }
    return null;
  });

  const [statusChangeNote, setStatusChangeNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync if selectedLeakId prop changes from global search or overview
  React.useEffect(() => {
    if (selectedLeakId) {
      const match = leaks.find((l) => l.id === selectedLeakId);
      if (match) setActiveLeak(match);
    }
  }, [selectedLeakId, leaks]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStatusChange = (leakId: string, newStatus: LeakStatus) => {
    onUpdateStatus(leakId, newStatus, statusChangeNote || `Marked as ${newStatus}`);
    setStatusChangeNote('');
    // Update active leak in drawer
    const updated = leaks.find((l) => l.id === leakId);
    if (updated) {
      setActiveLeak({ ...updated, status: newStatus });
    }
    showToast(`Finding status updated to "${newStatus}"`);
  };

  // Filter & Sort
  const filteredLeaks = useMemo(() => {
    return leaks.filter((leak) => {
      const matchesSearch =
        searchQuery === '' ||
        leak.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        leak.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        leak.affectedProducts.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSeverity = selectedSeverity === 'All' || leak.severity === selectedSeverity;
      const matchesCategory = selectedCategory === 'All' || leak.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || leak.status === selectedStatus;

      return matchesSearch && matchesSeverity && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'impact') {
        return sortOrder === 'desc'
          ? b.estimatedImpactINR - a.estimatedImpactINR
          : a.estimatedImpactINR - b.estimatedImpactINR;
      }
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.detectedDate).getTime() - new Date(a.detectedDate).getTime()
          : new Date(a.detectedDate).getTime() - new Date(b.detectedDate).getTime();
      }
      if (sortBy === 'severity') {
        const score = (s: SeverityLevel) =>
          s === 'Critical' ? 4 : s === 'High' ? 3 : s === 'Medium' ? 2 : 1;
        return sortOrder === 'desc' ? score(b.severity) - score(a.severity) : score(a.severity) - score(b.severity);
      }
      return 0;
    });
  }, [leaks, searchQuery, selectedSeverity, selectedCategory, selectedStatus, sortBy, sortOrder]);

  const categories: LeakCategory[] = [
    'Excessive Discounting',
    'High Return Rates',
    'Logistics & Shipping',
    'Payment Gateway Fees',
    'Low Margin SKUs',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium border border-slate-700 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Profit Leaks & Findings
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
              {leaks.filter((l) => l.status === 'Open').length} Open Action Items
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Evidence-based audit discoveries ranked by net cash bleed with transparent calculation breakdowns.
          </p>
        </div>

        {onNavigateToSimulator && (
          <button
            onClick={onNavigateToSimulator}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simulate Leak Fixes
          </button>
        )}
      </div>

      {/* Filter and Control Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, root cause, or affected SKU..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Severity */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-[11px] font-medium text-slate-400 mr-1.5">Severity:</span>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Category */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-[11px] font-medium text-slate-400 mr-1.5">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 text-xs focus:outline-hidden cursor-pointer max-w-[140px] truncate"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-[11px] font-medium text-slate-400 mr-1.5">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Reviewing">Reviewing</option>
                <option value="Resolved">Resolved</option>
                <option value="Dismissed">Dismissed</option>
              </select>
            </div>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg px-2.5 py-1.5 text-slate-600 font-medium transition cursor-pointer"
              title="Toggle ascending / descending"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>{sortOrder === 'desc' ? 'High → Low' : 'Low → High'}</span>
            </button>
          </div>
        </div>

        {/* Active Filters count indicator */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-700">{filteredLeaks.length}</strong> of {leaks.length} findings
          </span>
          {(searchQuery || selectedSeverity !== 'All' || selectedCategory !== 'All' || selectedStatus !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSeverity('All');
                setSelectedCategory('All');
                setSelectedStatus('All');
              }}
              className="text-blue-600 hover:underline font-medium cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Leaks Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {filteredLeaks.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No findings match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your severity or category filter to inspect other recorded anomalies.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Profit Leak Finding</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Est. Monthly Loss</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Detected</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaks.map((leak) => {
                  const isSelected = activeLeak?.id === leak.id;
                  return (
                    <tr
                      key={leak.id}
                      onClick={() => setActiveLeak(leak)}
                      className={`hover:bg-slate-50/80 transition cursor-pointer ${
                        isSelected ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      {/* Severity badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] ${
                            leak.severity === 'Critical'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : leak.severity === 'High'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : leak.severity === 'Medium'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              leak.severity === 'Critical'
                                ? 'bg-rose-500'
                                : leak.severity === 'High'
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                            }`}
                          />
                          {leak.severity}
                        </span>
                      </td>

                      {/* Finding Title & affected */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 max-w-md">
                          {leak.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {leak.summary}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {leak.affectedCount} impacted records • {leak.affectedProducts.join(', ')}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {leak.category}
                        </span>
                      </td>

                      {/* Impact */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="font-mono font-bold text-rose-600 text-sm">
                          -{formatINR(leak.estimatedImpactINR)}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-medium">
                          +{formatINR(leak.potentialMonthlyRecoveryINR)} recoverable
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] ${
                            leak.status === 'Open'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : leak.status === 'Reviewing'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : leak.status === 'Resolved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {leak.status === 'Open' && <Clock className="w-3 h-3 text-rose-500" />}
                          {leak.status === 'Reviewing' && <Clock className="w-3 h-3 text-amber-500" />}
                          {leak.status === 'Resolved' && <Check className="w-3 h-3 text-emerald-500" />}
                          {leak.status === 'Dismissed' && <Ban className="w-3 h-3 text-slate-400" />}
                          {leak.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {leak.detectedDate}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLeak(leak);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          View Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Finding Detail Drawer */}
      {activeLeak && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div 
            className="w-full max-w-2xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col slide-in-from-right duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      activeLeak.severity === 'Critical'
                        ? 'bg-rose-100 text-rose-700'
                        : activeLeak.severity === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {activeLeak.severity} Severity
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {activeLeak.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {activeLeak.id}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 leading-snug">
                  {activeLeak.title}
                </h2>
              </div>
              <button
                onClick={() => {
                  setActiveLeak(null);
                  if (onClearSelectedLeak) onClearSelectedLeak();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-600 leading-relaxed">
              {/* Financial Impact Banner */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Estimated Monthly Profit Drain
                  </span>
                  <span className="font-mono text-xl font-bold text-rose-600">
                    -{formatINR(activeLeak.estimatedImpactINR)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Impacts ~{activeLeak.affectedCount} store operations / month
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Target Monthly Recovery
                  </span>
                  <span className="font-mono text-xl font-bold text-emerald-600">
                    +{formatINR(activeLeak.potentialMonthlyRecoveryINR)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Achievable via recommended mitigation
                  </span>
                </div>
              </div>

              {/* Status Update Control Bar */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-950 text-xs">Manage Finding Status:</span>
                  <span className="text-[11px] font-semibold text-slate-600">
                    Current: <strong>{activeLeak.status}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange(activeLeak.id, 'Open')}
                    disabled={activeLeak.status === 'Open'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeLeak.status === 'Open'
                        ? 'bg-rose-600 text-white'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleStatusChange(activeLeak.id, 'Reviewing')}
                    disabled={activeLeak.status === 'Reviewing'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeLeak.status === 'Reviewing'
                        ? 'bg-amber-600 text-white'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    Mark as Reviewing
                  </button>
                  <button
                    onClick={() => handleStatusChange(activeLeak.id, 'Resolved')}
                    disabled={activeLeak.status === 'Resolved'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                      activeLeak.status === 'Resolved'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleStatusChange(activeLeak.id, 'Dismissed')}
                    disabled={activeLeak.status === 'Dismissed'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeLeak.status === 'Dismissed'
                        ? 'bg-slate-700 text-white'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              {/* Evidence & Root Cause */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                  Observed Evidence & Audit Findings
                </h3>
                <p className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                  {activeLeak.summary}
                </p>
              </div>

              {/* Root Cause */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                  Identified Root Cause
                </h3>
                <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 text-amber-950 font-medium">
                  {activeLeak.rootCause}
                </div>
              </div>

              {/* Transparent Financial Calculation Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                    Transparent Calculation Breakdown
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Deterministic Logic</span>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                  {activeLeak.calculationBreakdown.map((step, idx) => (
                    <div key={idx} className="p-3 flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-slate-800 text-xs">{step.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{step.description}</div>
                      </div>
                      <span
                        className={`font-mono font-bold text-xs shrink-0 ${
                          step.isNegative ? 'text-rose-600' : 'text-slate-800'
                        }`}
                      >
                        {step.isNegative ? '-' : ''}
                        {typeof step.amount === 'number' && step.amount > 1000
                          ? formatINR(step.amount)
                          : step.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Affected Products */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                  Affected Products & SKUs
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeLeak.affectedProducts.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Action Playbook */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                  Actionable Mitigation Playbook
                </h3>
                <div className="space-y-2">
                  {activeLeak.recommendedActions.map((action, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-start gap-2.5"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-emerald-950 font-medium text-xs leading-relaxed">
                        {action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit Trail */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                  Audit History
                </h3>
                <div className="space-y-2">
                  {activeLeak.auditTrail.map((record, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-600 border border-slate-100">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>{record.action}</span>
                        <span className="font-mono text-slate-400 font-normal">{record.timestamp}</span>
                      </div>
                      <div className="text-slate-500 mt-0.5">{record.note} ({record.user})</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Deterministic calculation • Sample audit log
              </span>
              <button
                onClick={() => {
                  setActiveLeak(null);
                  if (onClearSelectedLeak) onClearSelectedLeak();
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-xs cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
