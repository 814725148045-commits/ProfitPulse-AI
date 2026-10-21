import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  AlertTriangle, 
  Package, 
  ShoppingBag, 
  ChevronRight, 
  ArrowUpRight 
} from 'lucide-react';
import { localDemoStore } from '../../services/apiClient';
import { formatINR } from '../../utils/financialCalculations';
import { NavigationTab } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab, targetId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const leaks = localDemoStore.getLeaks();
  const products = localDemoStore.getProducts();
  const orders = localDemoStore.getOrders();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQ = query.toLowerCase().trim();

  const filteredLeaks = cleanQ
    ? leaks.filter(
        (l) =>
          l.title.toLowerCase().includes(cleanQ) ||
          l.category.toLowerCase().includes(cleanQ) ||
          l.affectedProducts.some((p) => p.toLowerCase().includes(cleanQ))
      )
    : leaks.slice(0, 3);

  const filteredProducts = cleanQ
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(cleanQ) ||
          p.sku.toLowerCase().includes(cleanQ) ||
          p.category.toLowerCase().includes(cleanQ)
      )
    : products.slice(0, 3);

  const filteredOrders = cleanQ
    ? orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(cleanQ) ||
          o.customerName.toLowerCase().includes(cleanQ) ||
          o.customerCity.toLowerCase().includes(cleanQ)
      )
    : orders.slice(0, 3);

  const hasResults = filteredLeaks.length > 0 || filteredProducts.length > 0 || filteredOrders.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-slate-200 flex items-center px-4">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search profit leaks, products, SKUs, orders, or customers..."
            className="w-full py-4 pl-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-5 text-xs">
          {!hasResults && (
            <div className="text-center py-8 text-slate-400">
              No results found for "{query}". Try searching "Candle", "RTO", "AK-APP", or "Delhi".
            </div>
          )}

          {/* Leaks section */}
          {filteredLeaks.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2 flex items-center justify-between">
                <span>Profit Leaks & Findings</span>
                <span className="text-[10px] text-slate-400">{filteredLeaks.length} items</span>
              </div>
              <div className="space-y-1">
                {filteredLeaks.map((leak) => (
                  <button
                    key={leak.id}
                    onClick={() => {
                      onNavigate('leaks', leak.id);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition flex items-center justify-between group cursor-pointer border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg shrink-0 ${
                        leak.severity === 'Critical' ? 'bg-rose-100 text-rose-600' :
                        leak.severity === 'High' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-xs group-hover:text-blue-600 transition truncate max-w-md">
                          {leak.title}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {leak.category} • {leak.status}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-semibold text-rose-600 text-xs">
                        -{formatINR(leak.estimatedImpactINR)}/mo
                      </div>
                      <span className="text-[10px] text-slate-400 group-hover:text-blue-600 flex items-center justify-end gap-0.5">
                        Inspect <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products section */}
          {filteredProducts.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2 flex items-center justify-between">
                <span>Products & SKUs</span>
                <span className="text-[10px] text-slate-400">{filteredProducts.length} items</span>
              </div>
              <div className="space-y-1">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onNavigate('products', p.id);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition flex items-center justify-between group cursor-pointer border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-xs group-hover:text-blue-600 transition truncate max-w-md">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {p.sku} • {p.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-mono font-semibold text-xs ${
                        p.contributionProfit < 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {p.contributionMargin.toFixed(1)}% margin
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {p.unitsSold} units sold
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Orders section */}
          {filteredOrders.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2 flex items-center justify-between">
                <span>Recent Orders</span>
                <span className="text-[10px] text-slate-400">{filteredOrders.length} items</span>
              </div>
              <div className="space-y-1">
                {filteredOrders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      onNavigate('orders', o.id);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition flex items-center justify-between group cursor-pointer border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-xs group-hover:text-blue-600 transition">
                          {o.orderNumber} — {o.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {o.customerCity}, {o.customerState} • {o.status}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-semibold text-slate-900 text-xs">
                        {formatINR(o.grossAmount)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {o.channel}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 px-4">
          <span>Tip: Jump directly into details by clicking any result</span>
          <span className="font-mono">ProfitPulse Search</span>
        </div>
      </div>
    </div>
  );
};
