import { SimulationInputs, SimulationResult, FinancialTotals } from '../types';

/**
 * Deterministic Financial Calculations for ProfitPulse AI
 * 
 * Rules:
 * - Net Sales = Gross Sales - Discounts - Sales Refunds
 * - Contribution Profit = Net Sales - COGS - Shipping/Fulfillment Costs - Payment Fees - Other Variable Costs
 * - Contribution Margin (%) = (Contribution Profit / Net Sales) * 100
 */

export function calculateNetSales(
  grossSales: number,
  discounts: number,
  refunds: number
): number {
  return Math.max(0, grossSales - discounts - refunds);
}

export function calculateContributionProfit(
  netSales: number,
  cogs: number,
  shippingCosts: number,
  paymentFees: number,
  otherVariableCosts: number = 0
): number {
  return netSales - cogs - shippingCosts - paymentFees - otherVariableCosts;
}

export function calculateContributionMargin(
  contributionProfit: number,
  netSales: number
): number {
  if (!netSales || netSales <= 0) return 0;
  return (contributionProfit / netSales) * 100;
}

/**
 * Format Indian Rupee currency with standard Indian grouping (Lakhs, Crores)
 * or standard formatted string.
 */
export function formatINR(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  
  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  if (compact) {
    if (abs >= 10000000) {
      const cr = (abs / 10000000).toFixed(2);
      return `${isNegative ? '-' : ''}₹${cr} Cr`;
    }
    if (abs >= 100000) {
      const lakh = (abs / 100000).toFixed(2);
      return `${isNegative ? '-' : ''}₹${lakh} L`;
    }
    if (abs >= 1000) {
      const k = (abs / 1000).toFixed(1);
      return `${isNegative ? '-' : ''}₹${k} K`;
    }
  }

  // Format with standard Indian numbering system
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(abs);

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function formatPercent(value: number, includeSign: boolean = false): string {
  if (isNaN(value)) return '0.0%';
  const prefix = includeSign && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

export function formatINRDelta(amount: number): string {
  if (isNaN(amount)) return '₹0';
  const prefix = amount > 0 ? '+' : amount < 0 ? '-' : '';
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
  return `${prefix}₹${formatted}`;
}

export type { FinancialTotals };


/**
 * Deterministically recalculates financial recovery based on simulation controls
 */
export function calculateRecoverySimulation(
  baseline: FinancialTotals,
  inputs: SimulationInputs
): SimulationResult {
  // 1. Discount reduction savings
  // When discounts are reduced by X%, Net Sales increases by that saved amount
  const discountReduction = inputs.discountReductionPct / 100;
  const discountsSaved = baseline.discounts * discountReduction;

  // 2. Refund rate reduction savings
  // Reducing refunds increases Net Sales and saves reverse shipping
  const refundReduction = inputs.refundRateReductionPct / 100;
  const refundsPrevented = baseline.refunds * refundReduction;
  // Saving returns also avoids return reverse logistics (estimated at 35% of shipping related to refunds)
  const returnShippingSaved = (baseline.shippingCosts * 0.35) * refundReduction;

  // 3. Shipping cost optimization
  // Packaging weight reduction, courier renegotiation
  const shippingReduction = inputs.shippingCostOptimizationPct / 100;
  const directShippingSaved = (baseline.shippingCosts * 0.65) * shippingReduction;
  const totalShippingSaved = directShippingSaved + returnShippingSaved;

  // 4. Payment Gateway fee optimization
  // UPI push (0.0% MDR on UPI) vs Credit card 2%
  const feeReduction = inputs.paymentFeeOptimizationPct / 100;
  const gatewayFeesSaved = baseline.paymentFees * feeReduction;

  // 5. SKU rationalization
  const skuGain = inputs.eliminateNegativeMarginSkus 
    ? Math.abs(baseline.negativeMarginLoss) 
    : 0;

  // Simulated Net Sales = Baseline Net Sales + Discounts preserved + Refunds retained
  const simulatedNetSales = baseline.netSales + discountsSaved + refundsPrevented;

  // Simulated Variable Costs
  const simulatedCogs = baseline.cogs; // COGS unchanged
  const simulatedShipping = Math.max(0, baseline.shippingCosts - totalShippingSaved);
  const simulatedFees = Math.max(0, baseline.paymentFees - gatewayFeesSaved);
  const simulatedOther = baseline.otherVariableCosts;

  // Simulated Contribution Profit
  let simulatedProfit = simulatedNetSales - simulatedCogs - simulatedShipping - simulatedFees - simulatedOther + skuGain;
  
  const baselineProfit = baseline.contributionProfit;
  const profitDelta = simulatedProfit - baselineProfit;
  const netSalesDelta = simulatedNetSales - baseline.netSales;

  const baselineMargin = calculateContributionMargin(baselineProfit, baseline.netSales);
  const simulatedMargin = calculateContributionMargin(simulatedProfit, simulatedNetSales);
  const marginDelta = simulatedMargin - baselineMargin;

  // Annualized recovery potential (30-day baseline scaled to 12 months)
  const annualizedSavings = profitDelta * 12;

  return {
    baselineNetSales: baseline.netSales,
    simulatedNetSales,
    netSalesDelta,
    baselineProfit,
    simulatedProfit,
    profitDelta,
    baselineMargin,
    simulatedMargin,
    marginDelta,
    annualizedSavings,
    savingsBreakdown: {
      discountsSaved,
      refundsPrevented,
      shippingSaved: totalShippingSaved,
      gatewayFeesSaved,
      skuRationalizationGain: skuGain,
    },
  };
}
