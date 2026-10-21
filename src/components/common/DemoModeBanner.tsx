import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronRight, Database, ExternalLink, HelpCircle, X } from 'lucide-react';
import { API_BASE_URL } from '../../services/apiClient';

interface DemoModeBannerProps {
  onOpenSettings?: () => void;
  isBackendConnected?: boolean;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({ 
  onOpenSettings,
  isBackendConnected = false 
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (isDismissed) return null;

  return (
    <>
      <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-900 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2 max-w-4xl">
          <span className="inline-flex items-center gap-1 font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded text-[11px] uppercase tracking-wide shrink-0">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
            Sample Demo Data
          </span>
          <p className="truncate sm:whitespace-normal">
            Figures shown are verified illustrative records for an Indian D2C brand in INR (₹). No live business data is altered.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <button
            onClick={() => setShowModal(true)}
            className="hidden sm:inline-flex items-center gap-1 font-medium text-amber-800 hover:text-amber-950 underline decoration-amber-400 underline-offset-2 cursor-pointer"
          >
            Learn about Data Sources
          </button>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1 font-medium text-amber-800 hover:text-amber-950 hover:underline cursor-pointer"
            >
              Backend API Status
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setIsDismissed(true)}
            className="text-amber-600 hover:text-amber-900 p-0.5 rounded transition cursor-pointer"
            title="Dismiss notice for this session"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Demo Data & Accounting Principles</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-900">
                <p className="font-semibold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Deterministic Accounting Standard
                </p>
                <p>
                  Financial figures in ProfitPulse AI are computed with deterministic logic, not generative AI approximations:
                </p>
                <div className="mt-2 space-y-1 font-mono text-[11px] bg-white/70 p-2 rounded border border-blue-100">
                  <div>• Net Sales = Gross Sales − Discounts − Sales Refunds</div>
                  <div>• Contribution Profit = Net Sales − COGS − Shipping − Gateway Fees</div>
                  <div>• Contribution Margin = (Contribution Profit / Net Sales) × 100</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 text-xs mb-1">FastAPI & PostgreSQL Backend Connection</h4>
                <p>
                  The API client is pre-configured to communicate with the FastAPI backend at <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">{API_BASE_URL}</code>.
                  When no live backend is active, this self-contained demo store serves realistic records to ensure full UI functionality.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium text-xs hover:bg-slate-800 cursor-pointer"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
