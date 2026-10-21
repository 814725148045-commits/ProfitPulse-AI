import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ArrowUpRight, 
  DollarSign, 
  Percent, 
  ShieldAlert, 
  ChevronRight, 
  Activity, 
  Sliders, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import { FinancialTotals, ProfitLeak, NavigationTab, DateRange } from '../../types';
import { formatINR, formatPercent, formatINRDelta } from '../../utils/financialCalculations';
import { SAMPLE_ACTIVITY_FEED } from '../../data/sampleData';

interface OverviewPageProps {
  totals: FinancialTotals;
  leaks: ProfitLeak[];
  onNavigate: (tab: NavigationTab, targetId?: string) => void;
  dateRange: DateRange;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  totals,
  leaks,
  onNavigate,
  dateRange,
}) => {
  const [activeTrendMetric, setActiveTrendMetric] = useState<'both' | 'profit' | 'leaks'>('both');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<number | null>(null);

  const activeLeaks = leaks.filter((l) => l.status === 'Open' || l.status === 'Reviewing');
  const criticalLeaks = activeLeaks.filter((l) => l.severity === 'Critical');
  const topFindings = [...activeLeaks].sort((a, b) => b.estimatedImpactINR - a.estimatedImpactINR).slice(0, 3);

  // Leak categories breakdown
  const categoryMap = leaks.reduce<Record<string, { totalImpact: number; count: number }>>((acc, leak) => {
    if (!acc[leak.category]) {
      acc[leak.category] = { totalImpact: 0, count: 0 };
    }
    acc[leak.category].totalImpact += leak.estimatedImpactINR;
    acc[leak.category].count += 1;
    return acc;
  }, {});

  const categoryList = Object.entries(categoryMap).map(([cat, data]) => ({
    name: cat,
    impact: data.totalImpact,
    count: data.count,
    pctOfTotal: totals.profitAtRisk > 0 ? (data.totalImpact / totals.profitAtRisk) * 100 : 0,
  })).sort((a, b) => b.impact - a.impact);

  // Multiplier for date range display adjustments
  const dateRangeMultiplier = 
    dateRange === '7d' ? 0.25 : 
    dateRange === '90d' ? 2.85 : 
    dateRange === '12m' ? 11.4 : 
    dateRange === 'ytd' ? 6.8 : 1.0;

  const displayNetSales = totals.netSales * dateRangeMultiplier;
  const displayProfit = totals.contributionProfit * dateRangeMultiplier;
  const displayRisk = totals.profitAtRisk * dateRangeMultiplier;
  const marginPct = totals.contributionMargin;

  // Monthly Trend Chart mock dataset
  const trendMonths = [
    { label: 'May', netSales: 8200000, profit: 3280000, leaks: 890000 },
    { label: 'Jun', netSales: 8900000, profit: 3650000, leaks: 940000 },
    { label: 'Jul', netSales: 9400000, profit: 3850000, leaks: 1120000 },
    { label: 'Aug', netSales: 9100000, profit: 3720000, leaks: 1250000 },
    { label: 'Sep', netSales: 10400000, profit: 4180000, leaks: 1410000 },
    { label: 'Oct (Current)', netSales: displayNetSales, profit: displayProfit, leaks: displayRisk },
  ];

  // SVG dimensions
  const svgWidth = 650;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const maxVal = Math.max(...trendMonths.map((m) => Math.max(m.netSales, m.profit, m.leaks))) * 1.15;

  const getX = (index: number) => paddingX + (index * (svgWidth - 2 * paddingX)) / (trendMonths.length - 1);
  const getY = (val: number) => svgHeight - paddingY - (val / maxVal) * (svgHeight - 2 * paddingY);

  const netSalesPath = trendMonths.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(m.netSales)}`).join(' ');
  const profitPath = trendMonths.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(m.profit)}`).join(' ');
  const leakPath = trendMonths.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(m.leaks)}`).join(' ');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Hero Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Financial Profit Health</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Audited Deterministic Ledger
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time reconciliation of sales, deductions, and detected profit leaks for {dateRange === '30d' ? 'the past 30 days' : `period: ${dateRange.toUpperCase()}`}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('simulator')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            Run Recovery Simulator
          </button>
          <button
            onClick={() => onNavigate('leaks')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition cursor-pointer"
          >
            Review {activeLeaks.length} Findings
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Primary Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Sales */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Net Sales</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight mt-1">
            {formatINR(displayNetSales)}
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px]">
            <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              +8.4% vs prev period
            </span>
            <span className="text-slate-400">
              Gross: {formatINR(totals.grossSales * dateRangeMultiplier, true)}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 border-t border-slate-100 pt-1.5">
            Gross minus discounts ({formatINR(totals.discounts * dateRangeMultiplier, true)}) & refunds
          </div>
        </div>

        {/* Contribution Profit */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Contribution Profit</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tracking-tight mt-1">
            {formatINR(displayProfit)}
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px]">
            <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +4.2% vs benchmark
            </span>
            <span className="text-slate-500 font-mono font-medium">
              Margin: {marginPct.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 border-t border-slate-100 pt-1.5">
            After COGS, shipping, & Razorpay transaction fees
          </div>
        </div>

        {/* Contribution Margin % */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Contribution Margin</span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight mt-1">
            {marginPct.toFixed(1)}%
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px]">
            <span className="text-amber-700 font-semibold flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3 text-amber-600" />
              -2.1% under potential (44.4%)
            </span>
            <span className="text-slate-400">Target: 45.0%</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 border-t border-slate-100 pt-1.5">
            Net contribution profit as % of net sales
          </div>
        </div>

        {/* Estimated Profit at Risk */}
        <div className="bg-gradient-to-br from-rose-50/80 to-amber-50/50 rounded-2xl border border-rose-200 p-4.5 shadow-2xs hover:shadow-xs transition relative overflow-hidden">
          <div className="flex items-center justify-between text-rose-800 text-xs font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              Profit At Risk
            </span>
            <span className="px-1.5 py-0.5 bg-rose-200/80 text-rose-900 rounded text-[10px] font-bold">
              {activeLeaks.length} Leaks
            </span>
          </div>
          <div className="text-2xl font-bold text-rose-700 font-mono tracking-tight mt-1">
            {formatINR(displayRisk)}
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px]">
            <span className="text-rose-700 font-semibold">
              {criticalLeaks.length} Critical Severities
            </span>
            <button
              onClick={() => onNavigate('leaks')}
              className="font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-0.5 cursor-pointer"
            >
              Audit Now <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="mt-2 text-[10px] text-slate-600 border-t border-rose-200/60 pt-1.5">
            Directly recoverable by addressing RTO & coupons
          </div>
        </div>
      </div>

      {/* Main Grid: Profit Trend + Cost Anatomy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profit & Sales Trend SVG Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Monthly Revenue & Profit Realization
              </h2>
              <p className="text-xs text-slate-500">
                Tracking Net Sales vs Contribution Profit vs Unrecovered Profit Leaks
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
              <button
                onClick={() => setActiveTrendMetric('both')}
                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                  activeTrendMetric === 'both' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Metrics
              </button>
              <button
                onClick={() => setActiveTrendMetric('profit')}
                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                  activeTrendMetric === 'profit' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Profit Focus
              </button>
              <button
                onClick={() => setActiveTrendMetric('leaks')}
                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                  activeTrendMetric === 'leaks' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Leak Impact
              </button>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-56 select-none"
            >
              {/* Horizontal Grid lines */}
              {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
                const y = svgHeight - paddingY - ratio * (svgHeight - 2 * paddingY);
                return (
                  <g key={ratio}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 6}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] fill-slate-400 font-mono"
                    >
                      {formatINR(maxVal * ratio, true)}
                    </text>
                  </g>
                );
              })}

              {/* Net Sales Line */}
              {(activeTrendMetric === 'both' || activeTrendMetric === 'profit') && (
                <path
                  d={netSalesPath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Contribution Profit Line */}
              {(activeTrendMetric === 'both' || activeTrendMetric === 'profit') && (
                <path
                  d={profitPath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Profit Leaks Line */}
              {(activeTrendMetric === 'both' || activeTrendMetric === 'leaks') && (
                <path
                  d={leakPath}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points */}
              {trendMonths.map((m, i) => {
                const x = getX(i);
                const isHovered = hoveredDataPoint === i;

                return (
                  <g key={i}>
                    {/* Hover vertical line */}
                    {isHovered && (
                      <line
                        x1={x}
                        y1={paddingY}
                        x2={x}
                        y2={svgHeight - paddingY}
                        stroke="#94a3b8"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Net Sales Dot */}
                    {(activeTrendMetric === 'both' || activeTrendMetric === 'profit') && (
                      <circle
                        cx={x}
                        cy={getY(m.netSales)}
                        r={isHovered ? 5 : 3.5}
                        fill="#3b82f6"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all cursor-pointer"
                        onMouseEnter={() => setHoveredDataPoint(i)}
                        onMouseLeave={() => setHoveredDataPoint(null)}
                      />
                    )}

                    {/* Profit Dot */}
                    {(activeTrendMetric === 'both' || activeTrendMetric === 'profit') && (
                      <circle
                        cx={x}
                        cy={getY(m.profit)}
                        r={isHovered ? 5 : 3.5}
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all cursor-pointer"
                        onMouseEnter={() => setHoveredDataPoint(i)}
                        onMouseLeave={() => setHoveredDataPoint(null)}
                      />
                    )}

                    {/* Leak Dot */}
                    {(activeTrendMetric === 'both' || activeTrendMetric === 'leaks') && (
                      <circle
                        cx={x}
                        cy={getY(m.leaks)}
                        r={isHovered ? 4.5 : 3}
                        fill="#f43f5e"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="transition-all cursor-pointer"
                        onMouseEnter={() => setHoveredDataPoint(i)}
                        onMouseLeave={() => setHoveredDataPoint(null)}
                      />
                    )}

                    {/* Month Label */}
                    <text
                      x={x}
                      y={svgHeight - 8}
                      textAnchor="middle"
                      className={`text-[10px] font-medium ${isHovered ? 'fill-blue-600 font-bold' : 'fill-slate-500'}`}
                    >
                      {m.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredDataPoint !== null && (
              <div
                className="absolute top-2 right-4 bg-slate-900/90 text-white p-2.5 rounded-xl text-[11px] shadow-xl backdrop-blur-xs border border-slate-700 pointer-events-none"
              >
                <div className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1.5">
                  {trendMonths[hoveredDataPoint].label}
                </div>
                <div className="space-y-1 font-mono">
                  <div className="flex items-center justify-between gap-4 text-blue-300">
                    <span>Net Sales:</span>
                    <span>{formatINR(trendMonths[hoveredDataPoint].netSales)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-emerald-300">
                    <span>Contrib. Profit:</span>
                    <span>{formatINR(trendMonths[hoveredDataPoint].profit)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-rose-300">
                    <span>Profit at Risk:</span>
                    <span>{formatINR(trendMonths[hoveredDataPoint].leaks)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-600 font-medium">Net Sales (₹)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">Contribution Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 border-t-2 border-dashed border-rose-500" />
              <span className="text-slate-600 font-medium">Profit Leak Drain</span>
            </div>
          </div>
        </div>

        {/* Cost & Margin Anatomy Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Revenue to Profit Waterfall
              </h2>
              <span className="text-[10px] font-mono text-slate-400">Audited ₹</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Step-by-step variable cost deductions from Gross GMV to final Contribution Profit.
            </p>

            <div className="space-y-2.5 text-xs">
              {/* Gross Sales */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">Gross Sales</span>
                <span className="font-mono font-bold text-slate-900">{formatINR(totals.grossSales * dateRangeMultiplier)}</span>
              </div>

              {/* Deductions */}
              <div className="space-y-1.5 pl-2 border-l-2 border-amber-300">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Discounts & Coupons
                  </span>
                  <span className="font-mono text-amber-700">-{formatINR(totals.discounts * dateRangeMultiplier)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Sales Refunds & Returns
                  </span>
                  <span className="font-mono text-amber-700">-{formatINR(totals.refunds * dateRangeMultiplier)}</span>
                </div>
              </div>

              {/* Net Sales */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/70 border border-blue-100">
                <span className="font-bold text-blue-950">Net Sales</span>
                <span className="font-mono font-bold text-blue-900">{formatINR(displayNetSales)}</span>
              </div>

              {/* Variable Fulfillment Deductions */}
              <div className="space-y-1.5 pl-2 border-l-2 border-rose-300">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Cost of Goods Sold (COGS)
                  </span>
                  <span className="font-mono text-rose-700">-{formatINR(totals.cogs * dateRangeMultiplier)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Logistics & Carrier Shipping
                  </span>
                  <span className="font-mono text-rose-700">-{formatINR(totals.shippingCosts * dateRangeMultiplier)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Razorpay & Gateway Fees
                  </span>
                  <span className="font-mono text-rose-700">-{formatINR(totals.paymentFees * dateRangeMultiplier)}</span>
                </div>
              </div>

              {/* Contribution Profit Final */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div>
                  <div className="font-bold text-emerald-950">Contribution Profit</div>
                  <div className="text-[10px] text-emerald-700 font-medium">Net Realized Profit</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-800 text-sm">{formatINR(displayProfit)}</div>
                  <div className="text-[10px] font-bold text-emerald-600">{marginPct.toFixed(1)}% margin</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>No double counting applied</span>
            <button
              onClick={() => onNavigate('simulator')}
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              Simulate Margin Uplift <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Highest Impact Findings + Category Breakdown + Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Highest-Impact Findings (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Highest-Impact Profit Leaks
              </h2>
              <p className="text-xs text-slate-500">
                Ranked by unrecovered financial damage to your monthly bottom line.
              </p>
            </div>
            <button
              onClick={() => onNavigate('leaks')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              View all {leaks.length} findings <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {topFindings.map((leak) => (
              <div
                key={leak.id}
                className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-2xs hover:border-blue-300 hover:shadow-xs transition group cursor-pointer"
                onClick={() => onNavigate('leaks', leak.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          leak.severity === 'Critical'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : leak.severity === 'High'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {leak.severity}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {leak.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Detected {leak.detectedDate}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">
                      {leak.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {leak.summary}
                    </p>

                    <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        {leak.affectedCount} impacted orders
                      </span>
                      <span>•</span>
                      <span className="text-slate-500 truncate max-w-xs">
                        Affected: {leak.affectedProducts.join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Monthly Loss
                      </span>
                      <span className="font-mono text-base font-bold text-rose-600">
                        -{formatINR(leak.estimatedImpactINR)}
                      </span>
                    </div>
                    <span className="sm:mt-2 text-xs font-semibold text-blue-600 group-hover:text-blue-800 flex items-center gap-0.5">
                      Inspect Breakdown <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Leak Category Breakdown & Activity Stream */}
        <div className="space-y-6">
          {/* Categories */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              Profit Leaks by Category
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Distribution of your {formatINR(totals.profitAtRisk)} total identified leaks.
            </p>

            <div className="space-y-3.5">
              {categoryList.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate max-w-[170px]">
                      {cat.name}
                    </span>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatINR(cat.impact)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full ${
                        cat.name === 'High Return Rates'
                          ? 'bg-rose-500'
                          : cat.name === 'Excessive Discounting'
                          ? 'bg-amber-500'
                          : cat.name === 'Logistics & Shipping'
                          ? 'bg-blue-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, cat.pctOfTotal))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{cat.count} findings</span>
                    <span>{cat.pctOfTotal.toFixed(0)}% of total risk</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">
                Recent Ledger Activity
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">Live Logs</span>
            </div>

            <div className="space-y-3 text-xs">
              {SAMPLE_ACTIVITY_FEED.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-start gap-2.5 pb-2.5 border-b border-slate-100 last:border-b-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-800 text-xs">{item.title}</div>
                    <div className="text-[11px] text-slate-500">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
