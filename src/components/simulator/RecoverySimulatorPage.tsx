import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  TrendingUp, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Check, 
  Percent, 
  Truck, 
  Tag, 
  CreditCard, 
  PackageX,
  AlertCircle
} from 'lucide-react';
import { FinancialTotals, SimulationInputs, SimulationResult } from '../../types';
import { calculateRecoverySimulation, formatINR, formatPercent, formatINRDelta } from '../../utils/financialCalculations';

interface RecoverySimulatorPageProps {
  totals: FinancialTotals;
  onNavigateToLeaks?: () => void;
}

export const RecoverySimulatorPage: React.FC<RecoverySimulatorPageProps> = ({
  totals,
  onNavigateToLeaks,
}) => {
  const [inputs, setInputs] = useState<SimulationInputs>({
    discountReductionPct: 20, // 20% discount discipline
    refundRateReductionPct: 30, // 30% reduction in COD RTO via WhatsApp OTP
    shippingCostOptimizationPct: 15, // 15% courier packaging & volumetric optimization
    paymentFeeOptimizationPct: 25, // 25% fee savings via UPI default routing
    eliminateNegativeMarginSkus: true, // Reprice or drop negative SKUs
  });

  const [copied, setCopied] = useState(false);

  // Deterministic Recalculation
  const simulation = useMemo<SimulationResult>(() => {
    return calculateRecoverySimulation(totals, inputs);
  }, [totals, inputs]);

  // Preset scenarios
  const applyPreset = (preset: 'balanced' | 'rto' | 'discounts' | 'reset') => {
    if (preset === 'balanced') {
      setInputs({
        discountReductionPct: 25,
        refundRateReductionPct: 35,
        shippingCostOptimizationPct: 15,
        paymentFeeOptimizationPct: 20,
        eliminateNegativeMarginSkus: true,
      });
    } else if (preset === 'rto') {
      setInputs({
        discountReductionPct: 10,
        refundRateReductionPct: 55, // Aggressive OTP & pincode filtering
        shippingCostOptimizationPct: 25,
        paymentFeeOptimizationPct: 10,
        eliminateNegativeMarginSkus: true,
      });
    } else if (preset === 'discounts') {
      setInputs({
        discountReductionPct: 45, // Strict coupon minimums
        refundRateReductionPct: 15,
        shippingCostOptimizationPct: 10,
        paymentFeeOptimizationPct: 15,
        eliminateNegativeMarginSkus: false,
      });
    } else {
      setInputs({
        discountReductionPct: 0,
        refundRateReductionPct: 0,
        shippingCostOptimizationPct: 0,
        paymentFeeOptimizationPct: 0,
        eliminateNegativeMarginSkus: false,
      });
    }
  };

  const copyExecutiveSummary = () => {
    const summary = `PROFITPULSE AI - RECOVERY SIMULATION SUMMARY
Company: AuraKraft Living & Apparel
Baseline Contribution Profit: ${formatINR(simulation.baselineProfit)} (${simulation.baselineMargin.toFixed(1)}% margin)
Simulated Contribution Profit: ${formatINR(simulation.simulatedProfit)} (${simulation.simulatedMargin.toFixed(1)}% margin)
Monthly Profit Uplift: ${formatINRDelta(simulation.profitDelta)} (${formatPercent(simulation.marginDelta, true)} margin jump)
Projected Annualized Savings: ${formatINR(simulation.annualizedSavings)}

Simulated Parameters:
- Discount Reduction: ${inputs.discountReductionPct}% (Saves ${formatINR(simulation.savingsBreakdown.discountsSaved)})
- COD Return (RTO) Reduction: ${inputs.refundRateReductionPct}% (Retains ${formatINR(simulation.savingsBreakdown.refundsPrevented)})
- Shipping & Logistics Optimization: ${inputs.shippingCostOptimizationPct}% (Saves ${formatINR(simulation.savingsBreakdown.shippingSaved)})
- Gateway Fee Negotiation: ${inputs.paymentFeeOptimizationPct}% (Saves ${formatINR(simulation.savingsBreakdown.gatewayFeesSaved)})
- Negative Margin SKU Repricing: ${inputs.eliminateNegativeMarginSkus ? 'Enabled' : 'Disabled'} (+${formatINR(simulation.savingsBreakdown.skuRationalizationGain)})

*Disclaimer: Simulation model based on deterministic formulas. Actual results subject to customer demand elasticities.`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Profit Recovery Simulator
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
              Interactive Model
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Test strategic operational interventions and see deterministic impact on net contribution profit and margins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyExecutiveSummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            {copied ? 'Summary Copied!' : 'Export Simulation'}
          </button>
          <button
            onClick={() => applyPreset('reset')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            title="Reset controls to 0%"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Prominent Simulation Disclaimer Badge */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Simulation Model:</strong> Projections are calculated using deterministic financial formulas against your store's baseline ledger. Figures represent potential operational recoveries, not guaranteed future revenue.
          </span>
        </div>
      </div>

      {/* Preset Quick Actions */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-slate-500 mr-1">Quick Scenarios:</span>
        <button
          onClick={() => applyPreset('balanced')}
          className="px-3 py-1.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-lg font-medium transition cursor-pointer"
        >
          🎯 Balanced Quick-Wins (Recommended)
        </button>
        <button
          onClick={() => applyPreset('rto')}
          className="px-3 py-1.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 rounded-lg font-medium transition cursor-pointer"
        >
          📦 Aggressive COD RTO Reduction
        </button>
        <button
          onClick={() => applyPreset('discounts')}
          className="px-3 py-1.5 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 rounded-lg font-medium transition cursor-pointer"
        >
          🏷️ Strict Discount Guardrails
        </button>
      </div>

      {/* Main Layout: Interactive Sliders (Left) vs Real-Time Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-6">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Adjust Operational Levers
            </h2>

            {/* Slider 1: Discount Reduction */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  Reduce Unnecessary Promotional Discounts
                </span>
                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">
                  {inputs.discountReductionPct}% reduction
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={inputs.discountReductionPct}
                onChange={(e) =>
                  setInputs({ ...inputs, discountReductionPct: Number(e.target.value) })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0% (As Is: {formatINR(totals.discounts)})</span>
                <span className="font-medium text-emerald-600">
                  Saves ~{formatINR(simulation.savingsBreakdown.discountsSaved)} / mo
                </span>
                <span>50% Max Cap</span>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Enforcing ₹2,999 minimum order values for coupon codes and stopping automatic code stacking.
              </p>
            </div>

            {/* Slider 2: COD RTO Return Rate Reduction */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-rose-500" />
                  Cut COD Return-to-Origin (RTO) Rate
                </span>
                <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-xs">
                  {inputs.refundRateReductionPct}% reduction
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={inputs.refundRateReductionPct}
                onChange={(e) =>
                  setInputs({ ...inputs, refundRateReductionPct: Number(e.target.value) })
                }
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0% (As Is: 34% Tier-3 RTO)</span>
                <span className="font-medium text-emerald-600">
                  Retains {formatINR(simulation.savingsBreakdown.refundsPrevented)} + freight
                </span>
                <span>60% Target</span>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Mandatory WhatsApp OTP verification on orders &gt;₹1,500 + 5% UPI instant discount incentive.
              </p>
            </div>

            {/* Slider 3: Shipping & Logistics Cost Optimization */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <PackageX className="w-3.5 h-3.5 text-teal-600" />
                  Optimize Courier Packaging & Weight Freight
                </span>
                <span className="font-mono font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded text-xs">
                  {inputs.shippingCostOptimizationPct}% savings
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={inputs.shippingCostOptimizationPct}
                onChange={(e) =>
                  setInputs({ ...inputs, shippingCostOptimizationPct: Number(e.target.value) })
                }
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0% (As Is: {formatINR(totals.shippingCosts)})</span>
                <span className="font-medium text-emerald-600">
                  Saves ~{formatINR(simulation.savingsBreakdown.shippingSaved)} / mo
                </span>
                <span>30% Max</span>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Route heavy items &gt;2kg through Surface Express (₹170) instead of default Air (₹440).
              </p>
            </div>

            {/* Slider 4: Payment Gateway Fees */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                  Prioritize Zero-Fee UPI & Optimize Gateway MDR
                </span>
                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                  {inputs.paymentFeeOptimizationPct}% fee reduction
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={inputs.paymentFeeOptimizationPct}
                onChange={(e) =>
                  setInputs({ ...inputs, paymentFeeOptimizationPct: Number(e.target.value) })
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0% (As Is: {formatINR(totals.paymentFees)})</span>
                <span className="font-medium text-emerald-600">
                  Saves ~{formatINR(simulation.savingsBreakdown.gatewayFeesSaved)} / mo
                </span>
                <span>40% Max</span>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Defaulting to UPI Intent saves ~2.0% MDR on credit cards and eliminates failed retry loop charges.
              </p>
            </div>

            {/* Toggle 5: Negative Margin SKUs */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="space-y-0.5 max-w-sm">
                <span className="font-semibold text-slate-800 text-xs block">
                  Reprice / Rationalize Negative Margin SKUs
                </span>
                <p className="text-[11px] text-slate-500">
                  Eliminates {formatINR(Math.abs(totals.negativeMarginLoss))} monthly loss from Bell Metal Kadhai & Terracotta planters.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inputs.eliminateNegativeMarginSkus}
                  onChange={(e) =>
                    setInputs({ ...inputs, eliminateNegativeMarginSkus: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Results & Impact (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Profit Jump Hero Card */}
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  Simulated 30-Day Recovery
                </span>
                <span className="text-xs font-mono text-slate-400">Deterministic</span>
              </div>

              <div>
                <span className="text-xs text-slate-300 block">
                  Estimated Monthly Profit Improvement
                </span>
                <div className="font-mono text-3xl font-black text-emerald-400 mt-1 tracking-tight">
                  {formatINRDelta(simulation.profitDelta)}
                </div>
                <div className="text-xs text-emerald-200/90 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>
                    Contribution Margin rises from <strong>{simulation.baselineMargin.toFixed(1)}%</strong> to <strong>{simulation.simulatedMargin.toFixed(1)}%</strong> ({formatPercent(simulation.marginDelta, true)})
                  </span>
                </div>
              </div>

              {/* Annualized Projection */}
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-300 block">
                  Annualized Bottom-Line Value (12 Months)
                </span>
                <div className="font-mono text-xl font-bold text-white mt-0.5">
                  {formatINR(simulation.annualizedSavings)}
                </div>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  Direct net cashflow addition with zero increased customer acquisition spend.
                </p>
              </div>
            </div>
          </div>

          {/* Baseline vs Simulated Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-xs">
              Baseline vs. Simulated Ledger
            </h3>

            <div className="space-y-2 divide-y divide-slate-100 font-mono">
              {/* Net Sales */}
              <div className="flex justify-between items-center pt-2">
                <span className="font-sans text-slate-600">Net Sales Realized</span>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{formatINR(simulation.simulatedNetSales)}</div>
                  <div className="text-[10px] text-slate-400">Base: {formatINR(simulation.baselineNetSales)}</div>
                </div>
              </div>

              {/* Contribution Profit */}
              <div className="flex justify-between items-center pt-2">
                <span className="font-sans text-slate-600">Contribution Profit</span>
                <div className="text-right">
                  <div className="font-bold text-emerald-700">{formatINR(simulation.simulatedProfit)}</div>
                  <div className="text-[10px] text-slate-400">Base: {formatINR(simulation.baselineProfit)}</div>
                </div>
              </div>

              {/* Margin */}
              <div className="flex justify-between items-center pt-2">
                <span className="font-sans text-slate-600">Contribution Margin</span>
                <div className="text-right">
                  <div className="font-bold text-emerald-700">{simulation.simulatedMargin.toFixed(1)}%</div>
                  <div className="text-[10px] text-slate-400">Base: {simulation.baselineMargin.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Waterfall Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-xs">
              Where the {formatINR(simulation.profitDelta)} comes from:
            </h3>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Coupon & Discount Reduction</span>
                <span className="font-mono font-bold text-emerald-700">+{formatINR(simulation.savingsBreakdown.discountsSaved)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">COD RTO Prevention (Net Sales)</span>
                <span className="font-mono font-bold text-emerald-700">+{formatINR(simulation.savingsBreakdown.refundsPrevented)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Reverse & Air Freight Savings</span>
                <span className="font-mono font-bold text-emerald-700">+{formatINR(simulation.savingsBreakdown.shippingSaved)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">UPI Priority Gateway Fee Savings</span>
                <span className="font-mono font-bold text-emerald-700">+{formatINR(simulation.savingsBreakdown.gatewayFeesSaved)}</span>
              </div>
              {inputs.eliminateNegativeMarginSkus && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Negative SKU Rationalization</span>
                  <span className="font-mono font-bold text-emerald-700">+{formatINR(simulation.savingsBreakdown.skuRationalizationGain)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
