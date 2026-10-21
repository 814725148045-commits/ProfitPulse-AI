import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  ArrowUpDown, 
  AlertTriangle, 
  ChevronRight, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Sliders, 
  DollarSign, 
  Truck, 
  Tag, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Product, MarginHealth, NavigationTab } from '../../types';
import { formatINR, formatPercent } from '../../utils/financialCalculations';

interface ProductsPageProps {
  products: Product[];
  onNavigateToSimulator?: () => void;
  onNavigateToLeaks?: () => void;
  selectedProductId?: string | null;
  onClearSelectedProduct?: () => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  onNavigateToSimulator,
  onNavigateToLeaks,
  selectedProductId,
  onClearSelectedProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMarginStatus, setSelectedMarginStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'profit' | 'margin' | 'sales' | 'units' | 'returnRate'>('margin');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('asc'); // Default asc to surface bleeding products first!
  const [activeProduct, setActiveProduct] = useState<Product | null>(() => {
    if (selectedProductId) {
      return products.find((p) => p.id === selectedProductId) || null;
    }
    return null;
  });

  React.useEffect(() => {
    if (selectedProductId) {
      const match = products.find((p) => p.id === selectedProductId);
      if (match) setActiveProduct(match);
    }
  }, [selectedProductId, products]);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesMargin =
        selectedMarginStatus === 'All' ||
        (selectedMarginStatus === 'negative' && p.contributionProfit < 0) ||
        (selectedMarginStatus === 'caution' && p.marginStatus === 'caution') ||
        (selectedMarginStatus === 'healthy' && p.marginStatus === 'healthy');

      return matchesSearch && matchesCat && matchesMargin;
    }).sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortBy === 'profit') {
        valA = a.contributionProfit;
        valB = b.contributionProfit;
      } else if (sortBy === 'margin') {
        valA = a.contributionMargin;
        valB = b.contributionMargin;
      } else if (sortBy === 'sales') {
        valA = a.netSales;
        valB = b.netSales;
      } else if (sortBy === 'units') {
        valA = a.unitsSold;
        valB = b.unitsSold;
      } else if (sortBy === 'returnRate') {
        valA = a.returnRate;
        valB = b.returnRate;
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [products, searchQuery, selectedCategory, selectedMarginStatus, sortBy, sortOrder]);

  const negativeMarginProducts = products.filter((p) => p.contributionProfit < 0);
  const totalNegativeLoss = Math.abs(negativeMarginProducts.reduce((sum, p) => sum + p.contributionProfit, 0));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Product Catalog & Margins
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
              {products.length} SKUs Audited
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Unit economics, variable fulfillment costs, and net contribution margins per product.
          </p>
        </div>

        {onNavigateToSimulator && (
          <button
            onClick={onNavigateToSimulator}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition cursor-pointer self-start sm:self-auto"
          >
            <Sliders className="w-3.5 h-3.5" />
            Model Catalog Fixes
          </button>
        )}
      </div>

      {/* Negative Margins Callout Banner */}
      {negativeMarginProducts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-rose-950 text-xs block">
                {negativeMarginProducts.length} Products with Negative Contribution Margins (Bleeding Cash)
              </span>
              <p className="text-rose-800 mt-0.5">
                These items generate <strong>-{formatINR(totalNegativeLoss)}/month</strong> in direct financial loss because air logistics and return charges exceed net customer receipts.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setSelectedMarginStatus('negative');
                setSortBy('margin');
                setSortOrder('asc');
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs transition cursor-pointer"
            >
              Filter Negative SKUs
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, SKU, or category..."
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

          {/* Category, Margin Health, Sort Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Category */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-[11px] font-medium text-slate-400 mr-1.5">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Margin Status */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-[11px] font-medium text-slate-400 mr-1.5">Margin:</span>
              <select
                value={selectedMarginStatus}
                onChange={(e) => setSelectedMarginStatus(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="All">All Health Tiers</option>
                <option value="negative">Negative Margin (&lt; 0%)</option>
                <option value="caution">Caution (0 - 25%)</option>
                <option value="healthy">Healthy (&gt; 25%)</option>
              </select>
            </div>

            {/* Sort by Metric */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-[11px] font-medium text-slate-400 mr-1.5">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-semibold text-slate-700 text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="margin">Margin %</option>
                <option value="profit">Net Profit</option>
                <option value="sales">Net Sales</option>
                <option value="units">Units Sold</option>
                <option value="returnRate">Return Rate</option>
              </select>
            </div>

            {/* Asc / Desc */}
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg px-2.5 py-1.5 text-slate-600 font-medium transition cursor-pointer"
              title="Toggle Ascending / Descending"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>{sortOrder === 'asc' ? 'Low → High' : 'High → Low'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
          <span>Showing <strong className="text-slate-700">{filteredProducts.length}</strong> products</span>
          {(searchQuery || selectedCategory !== 'All' || selectedMarginStatus !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedMarginStatus('All');
              }}
              className="text-blue-600 hover:underline font-medium cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Product / SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Units Sold</th>
                <th className="py-3.5 px-4 text-right">Net Sales</th>
                <th className="py-3.5 px-4 text-right">COGS</th>
                <th className="py-3.5 px-4 text-right">Shipping</th>
                <th className="py-3.5 px-4 text-right">Contrib. Profit</th>
                <th className="py-3.5 px-4 text-right">Margin %</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const isNegative = p.contributionProfit < 0;
                const isSelected = activeProduct?.id === p.id;

                return (
                  <tr
                    key={p.id}
                    onClick={() => setActiveProduct(p)}
                    className={`hover:bg-slate-50/80 transition cursor-pointer ${
                      isSelected ? 'bg-blue-50/50' : isNegative ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    {/* Product Name & SKU */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 max-w-xs truncate">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                        <span>{p.sku}</span>
                        <span>•</span>
                        <span>Avg Price: {formatINR(p.price)}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {p.category}
                      </span>
                    </td>

                    {/* Units */}
                    <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-medium text-slate-700">
                      {p.unitsSold}
                    </td>

                    {/* Net Sales */}
                    <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-semibold text-slate-900">
                      {formatINR(p.netSales)}
                    </td>

                    {/* COGS */}
                    <td className="py-4 px-4 text-right whitespace-nowrap font-mono text-slate-600">
                      {formatINR(p.cogsTotal)}
                    </td>

                    {/* Shipping */}
                    <td className="py-4 px-4 text-right whitespace-nowrap font-mono text-slate-600">
                      {formatINR(p.shippingTotal)}
                    </td>

                    {/* Contribution Profit */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-mono font-bold text-xs ${
                          isNegative ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {formatINR(p.contributionProfit)}
                      </span>
                      {isNegative && (
                        <div className="text-[10px] text-rose-500 font-semibold">Loss Maker</div>
                      )}
                    </td>

                    {/* Margin % */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded text-xs ${
                          isNegative
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : p.marginStatus === 'caution'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {p.contributionMargin.toFixed(1)}%
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {p.returnRate}% returns
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProduct(p);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        Inspect
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Detail Slide-over Drawer */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div 
            className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col slide-in-from-right duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      activeProduct.contributionProfit < 0
                        ? 'bg-rose-100 text-rose-700'
                        : activeProduct.marginStatus === 'caution'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {activeProduct.contributionMargin.toFixed(1)}% Margin
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {activeProduct.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    SKU: {activeProduct.sku}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 leading-snug">
                  {activeProduct.name}
                </h2>
              </div>
              <button
                onClick={() => {
                  setActiveProduct(null);
                  if (onClearSelectedProduct) onClearSelectedProduct();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-600 leading-relaxed">
              {/* High Level KPI summary */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    30-Day Contribution Profit
                  </span>
                  <span
                    className={`font-mono text-xl font-bold ${
                      activeProduct.contributionProfit < 0 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {formatINR(activeProduct.contributionProfit)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {activeProduct.unitsSold} units shipped
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Net Sales Realized
                  </span>
                  <span className="font-mono text-xl font-bold text-slate-900">
                    {formatINR(activeProduct.netSales)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Return Rate: {activeProduct.returnRate}%
                  </span>
                </div>
              </div>

              {/* Reasons for Leak if applicable */}
              {activeProduct.reasonsForLeak && activeProduct.reasonsForLeak.length > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <div className="font-bold text-rose-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Key Profit Leak Drivers for this SKU:
                  </div>
                  <ul className="space-y-1.5 text-rose-900 pl-5 list-disc text-xs">
                    {activeProduct.reasonsForLeak.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Unit Economics Waterfall Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                    Financial Ledger Breakdown (30 Days)
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Deterministic Math</span>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Gross Sales</div>
                      <div className="text-[11px] text-slate-400">{activeProduct.unitsSold} units × {formatINR(activeProduct.price)}</div>
                    </div>
                    <span className="font-mono font-bold text-slate-900">{formatINR(activeProduct.grossSales)}</span>
                  </div>

                  <div className="p-3 flex items-center justify-between bg-amber-50/30">
                    <div>
                      <div className="font-medium text-amber-900">Less: Discounts & Promotions</div>
                      <div className="text-[11px] text-amber-700">Coupons & vouchers claimed</div>
                    </div>
                    <span className="font-mono font-bold text-amber-700">-{formatINR(activeProduct.discounts)}</span>
                  </div>

                  <div className="p-3 flex items-center justify-between bg-amber-50/30">
                    <div>
                      <div className="font-medium text-amber-900">Less: Sales Refunds</div>
                      <div className="text-[11px] text-amber-700">{activeProduct.returnRate}% return rate</div>
                    </div>
                    <span className="font-mono font-bold text-amber-700">-{formatINR(activeProduct.refunds)}</span>
                  </div>

                  <div className="p-3 flex items-center justify-between bg-blue-50/40">
                    <div className="font-bold text-blue-950">Net Sales Realized</div>
                    <span className="font-mono font-bold text-blue-900">{formatINR(activeProduct.netSales)}</span>
                  </div>

                  <div className="p-3 flex items-center justify-between bg-rose-50/30">
                    <div>
                      <div className="font-medium text-rose-900">Less: Cost of Goods Sold (COGS)</div>
                      <div className="text-[11px] text-rose-700">{formatINR(activeProduct.cogs)} / unit wholesale</div>
                    </div>
                    <span className="font-mono font-bold text-rose-700">-{formatINR(activeProduct.cogsTotal)}</span>
                  </div>

                  <div className="p-3 flex items-center justify-between bg-rose-50/30">
                    <div>
                      <div className="font-medium text-rose-900">Less: Courier Shipping & Logistics</div>
                      <div className="text-[11px] text-rose-700">Includes forward & reverse freight</div>
                    </div>
                    <span className="font-mono font-bold text-rose-700">-{formatINR(activeProduct.shippingTotal)}</span>
                  </div>

                  <div className="p-3 flex items-center justify-between bg-rose-50/30">
                    <div>
                      <div className="font-medium text-rose-900">Less: Payment Gateway Fees</div>
                      <div className="text-[11px] text-rose-700">Razorpay / COD collection surcharge</div>
                    </div>
                    <span className="font-mono font-bold text-rose-700">-{formatINR(activeProduct.paymentFeesTotal)}</span>
                  </div>

                  <div className="p-3.5 flex items-center justify-between bg-emerald-50/80">
                    <div>
                      <div className="font-bold text-emerald-950">Net Contribution Profit</div>
                      <div className="text-[11px] text-emerald-700">Margin: {activeProduct.contributionMargin.toFixed(1)}%</div>
                    </div>
                    <span
                      className={`font-mono text-base font-bold ${
                        activeProduct.contributionProfit < 0 ? 'text-rose-600' : 'text-emerald-800'
                      }`}
                    >
                      {formatINR(activeProduct.contributionProfit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product description */}
              <div className="space-y-1">
                <span className="font-bold text-slate-800 text-xs">Catalog Notes:</span>
                <p className="text-slate-500 text-xs">{activeProduct.description}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {onNavigateToSimulator ? (
                <button
                  onClick={() => {
                    setActiveProduct(null);
                    onNavigateToSimulator();
                  }}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Test Recovery in Simulator
                </button>
              ) : <div />}
              <button
                onClick={() => {
                  setActiveProduct(null);
                  if (onClearSelectedProduct) onClearSelectedProduct();
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
