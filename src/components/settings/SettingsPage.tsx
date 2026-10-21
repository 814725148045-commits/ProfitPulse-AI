import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Server, 
  Database, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  HelpCircle, 
  AlertTriangle,
  Radio
} from 'lucide-react';
import { OrganizationInfo } from '../../types';
import { apiClient, BackendHealth, API_BASE_URL, localDemoStore } from '../../services/apiClient';

interface SettingsPageProps {
  organization: OrganizationInfo;
  onResetData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  organization,
  onResetData,
}) => {
  const [backendUrl, setBackendUrl] = useState(API_BASE_URL);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);
  const [isDemoModeForced, setIsDemoModeForced] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    handleCheckBackend();
  }, []);

  const handleCheckBackend = async () => {
    setIsCheckingBackend(true);
    apiClient.setBaseUrl(backendUrl);
    const health = await apiClient.checkHealth();
    setBackendHealth(health);
    setIsCheckingBackend(false);
  };

  const handleToggleDemoMode = (enabled: boolean) => {
    setIsDemoModeForced(enabled);
    apiClient.setDemoMode(enabled);
  };

  const handleReset = () => {
    if (window.confirm('Reset all sample findings and order edits back to default state?')) {
      onResetData();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Settings & Backend Integrations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure organization details, reporting currency, data sources, and FastAPI connection.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      {/* Organization Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Building2 className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Organization Profile</h2>
            <p className="text-xs text-slate-500">Business registration and reporting parameters.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Company Name</label>
            <input
              type="text"
              defaultValue={organization.name}
              disabled
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">GSTIN (India)</label>
            <input
              type="text"
              defaultValue={organization.gstin}
              disabled
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Reporting Currency</label>
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800">
              <span className="w-6 h-6 rounded bg-blue-100 text-blue-800 flex items-center justify-center font-bold">₹</span>
              <span>Indian Rupee (INR) — Lakhs & Crores grouping</span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Fiscal Reporting Cycle</label>
            <input
              type="text"
              defaultValue={organization.fiscalYear}
              disabled
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Backend API Connection status (FastAPI & PostgreSQL) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">FastAPI & PostgreSQL Backend Connection</h2>
              <p className="text-xs text-slate-500">Live API endpoint configuration for production data.</p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              backendHealth?.connected
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendHealth?.connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
              }`}
            />
            {backendHealth?.connected ? 'FastAPI Connected' : 'Demo Mode Active'}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Backend Base URL (FastAPI host)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="http://127.0.0.1:8000"
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                onClick={handleCheckBackend}
                disabled={isCheckingBackend}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-xs flex items-center gap-1.5 transition cursor-pointer disabled:bg-slate-400"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingBackend ? 'animate-spin' : ''}`} />
                Test Health
              </button>
            </div>
          </div>

          {backendHealth && (
            <div
              className={`p-3.5 rounded-xl border ${
                backendHealth.connected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="font-bold flex items-center gap-2">
                {backendHealth.connected ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Radio className="w-4 h-4 text-amber-600" />
                )}
                <span>{backendHealth.statusMessage}</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed">
                {backendHealth.connected
                  ? `Response received in ${backendHealth.latencyMs}ms from FastAPI server.`
                  : `FastAPI is currently not running at this address. ProfitPulse AI automatically uses internal deterministic sample data so you can test all features without interruption.`}
              </p>
            </div>
          )}

          {/* Mode switch */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 text-xs block">Operating Data Mode</span>
              <p className="text-[11px] text-slate-500">
                {isDemoModeForced
                  ? 'Currently serving realistic Indian ecommerce demo data.'
                  : 'Attempting live API calls to FastAPI.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleDemoMode(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  isDemoModeForced
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Force Demo Mode
              </button>
              <button
                onClick={() => handleToggleDemoMode(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  !isDemoModeForced
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Live API
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Channels & Data Sources */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Database className="w-5 h-5 text-teal-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">E-Commerce & Carrier Integrations</h2>
            <p className="text-xs text-slate-500">Sync status across connected sales channels and logistics partners.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Shopify Plus Store</div>
              <div className="text-[11px] text-slate-500">aurakraft.in (Webhook sync active)</div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3" /> Connected
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Amazon.in Seller Central</div>
              <div className="text-[11px] text-slate-500">SP-API Order & Settlement Feed</div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3" /> Connected
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Shiprocket Logistics</div>
              <div className="text-[11px] text-slate-500">Airway Bill tracking & RTO logs</div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3" /> Connected
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">Razorpay Payment Gateway</div>
              <div className="text-[11px] text-slate-500">Settlements, refunds & MDR audit</div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3" /> Connected
            </span>
          </div>
        </div>
      </div>

      {/* Reset Demo Data */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Reset Sample Ledger Data</h2>
          <p className="text-xs text-slate-500">
            Restore original sample figures, order logs, and reset resolved finding statuses back to Open.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 rounded-xl text-xs font-semibold text-slate-700 transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo State
        </button>
      </div>
    </div>
  );
};
