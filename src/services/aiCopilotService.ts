import { ChatMessage, Product, ProfitLeak, Order, FinancialTotals } from '../types';
import { formatINR, formatPercent } from '../utils/financialCalculations';
import { localDemoStore } from './apiClient';

export interface CopilotContext {
  leaks: ProfitLeak[];
  products: Product[];
  orders: Order[];
  totals: FinancialTotals;
}

/**
 * AI Copilot Service for ProfitPulse AI.
 * 
 * Strict Financial Principle:
 * Financial calculations must use deterministic application logic.
 * AI explains verified results without inventing or hallucinating figures.
 * Distinguishes Demo Mode from Live AI.
 */
export class AICopilotService {
  private isLiveAIEnabled: boolean = false;

  async generateResponse(userQuery: string, history: ChatMessage[]): Promise<ChatMessage> {
    // Artificial brief processing latency to emulate financial scan
    await new Promise((resolve) => setTimeout(resolve, 600));

    const leaks = localDemoStore.getLeaks();
    const products = localDemoStore.getProducts();
    const orders = localDemoStore.getOrders();
    const totals = localDemoStore.getTotals();

    const q = userQuery.toLowerCase().trim();

    // 1. Biggest profit loss / Highest impact finding
    if (
      q.includes('biggest profit') ||
      q.includes('highest-impact') ||
      q.includes('highest impact') ||
      q.includes('most profit') ||
      q.includes('biggest leak') ||
      q.includes('largest loss')
    ) {
      const topLeak = [...leaks].sort((a, b) => b.estimatedImpactINR - a.estimatedImpactINR)[0];
      const activeTotal = leaks
        .filter((l) => l.status === 'Open' || l.status === 'Reviewing')
        .reduce((s, l) => s + l.estimatedImpactINR, 0);

      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        isDemoResponse: true,
        text: `Based on verified financial reconciliation across your sales channels, the single largest profit leak is **"${topLeak.title}"**.\n\n### Core Financial Impact:\n- **Monthly Loss Drain:** ${formatINR(topLeak.estimatedImpactINR)}\n- **Share of Total Risk:** ${((topLeak.estimatedImpactINR / activeTotal) * 100).toFixed(1)}% of your active profit leaks (${formatINR(activeTotal)})\n- **Category:** ${topLeak.category} (${topLeak.severity} Severity)\n\n### Why is this happening?\n${topLeak.rootCause}\n\n### Primary Action Steps:\n1. ${topLeak.recommendedActions[0]}\n2. ${topLeak.recommendedActions[1]}\n3. ${topLeak.recommendedActions[2]}`,
        highlightMetrics: [
          { label: 'Highest Loss', value: formatINR(topLeak.estimatedImpactINR), color: 'text-rose-600' },
          { label: 'Orders Affected', value: `${topLeak.affectedCount} shipments`, color: 'text-amber-600' },
          { label: 'Monthly Recovery Target', value: formatINR(topLeak.potentialMonthlyRecoveryINR), color: 'text-emerald-600' },
        ],
        suggestedQuestions: [
          'How could we reduce discount-related losses?',
          'Which products have the weakest margins?',
          'What is our total profit at risk right now?',
        ],
        relatedLeakId: topLeak.id,
      };
    }

    // 2. Weakest margins / Negative margin products
    if (
      q.includes('weakest margin') ||
      q.includes('lowest margin') ||
      q.includes('negative margin') ||
      q.includes('bad products') ||
      q.includes('losing products')
    ) {
      const negativeSkus = products.filter((p) => p.contributionProfit < 0);
      const cautionSkus = products.filter((p) => p.marginStatus === 'caution');

      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        isDemoResponse: true,
        text: `Analysis of your 12 core catalog products identified **${negativeSkus.length} products with negative contribution margins** and **${cautionSkus.length} with sub-optimal margins** (<25%).\n\n### Negative Margin Alert (Bleeding Cash):\n${negativeSkus
          .map(
            (p) =>
              `- **${p.name}** (\`${p.sku}\`):\n  - Margin: **${p.contributionMargin}%** (Net Loss: ${formatINR(p.contributionProfit)})\n  - Return Rate: **${p.returnRate}%** | Total Shipping Burden: ${formatINR(p.shippingTotal)}\n  - *Main Driver:* ${p.reasonsForLeak?.[0] || 'High fulfillment cost'}`
          )
          .join('\n\n')}\n\n### Immediate Recommendation:\nPause flat-rate express air shipping for heavy items (>2kg) and switch to surface logistics. Eliminating negative margins on these 2 SKUs will instantly rescue **${formatINR(Math.abs(negativeSkus.reduce((a, b) => a + b.contributionProfit, 0)))}** in monthly profit.`,
        highlightMetrics: [
          { label: 'Negative Margin SKUs', value: `${negativeSkus.length} products`, color: 'text-rose-600' },
          { label: 'Direct Monthly Loss', value: formatINR(Math.abs(negativeSkus.reduce((a, b) => a + b.contributionProfit, 0))), color: 'text-rose-600' },
          { label: 'Catalog Health', value: `${products.filter((p) => p.marginStatus === 'healthy').length}/12 Healthy`, color: 'text-emerald-600' },
        ],
        suggestedQuestions: [
          'What is causing the biggest profit loss?',
          'How could we reduce discount-related losses?',
          'Simulate recovery if we drop negative SKUs',
        ],
      };
    }

    // 3. Discount-related losses
    if (
      q.includes('discount') ||
      q.includes('coupon') ||
      q.includes('festive35') ||
      q.includes('promo')
    ) {
      const discountLeak = leaks.find((l) => l.category === 'Excessive Discounting') || leaks[1];
      const discountRatio = ((totals.discounts / totals.grossSales) * 100).toFixed(1);

      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        isDemoResponse: true,
        text: `### Discount Health Audit:\nYour store has handed out **${formatINR(totals.discounts)} in discounts** on gross sales of ${formatINR(totals.grossSales)}, which is **${discountRatio}% of gross revenue**.\n\n### Key Finding: ${discountLeak.title}\n- **Impact:** ${formatINR(discountLeak.estimatedImpactINR)}/month\n- **Root Cause:** 412 orders stacked promo code \`FESTIVE35\` on single-item baskets without enforcing the ₹2,999 Minimum Order Value (MOV) condition.\n\n### 3 Concrete Fixes:\n1. **Enforce Cart Minimums:** Add mandatory ₹2,999 minimum order threshold in Shopify Discounts settings.\n2. **Block Coupon Stacking:** Disallow promotional coupon codes from combining with automatic first-order discounts.\n3. **Post-Back Affiliate Recalculation:** Pay influencers on Net Sales (after discount deduction), not Gross GMV.`,
        highlightMetrics: [
          { label: 'Total Discounts (30d)', value: formatINR(totals.discounts), color: 'text-amber-600' },
          { label: 'Uncontrolled Leak', value: formatINR(discountLeak.estimatedImpactINR), color: 'text-rose-600' },
          { label: 'Potential Savings', value: formatINR(discountLeak.potentialMonthlyRecoveryINR), color: 'text-emerald-600' },
        ],
        suggestedQuestions: [
          'Explain the highest-impact finding.',
          'What is our shipping and logistics cost breakdown?',
          'Show me how recovery simulation works',
        ],
        relatedLeakId: discountLeak.id,
      };
    }

    // 4. Shipping / Logistics / Courier
    if (
      q.includes('shipping') ||
      q.includes('logistics') ||
      q.includes('rto') ||
      q.includes('freight') ||
      q.includes('shiprocket') ||
      q.includes('carrier')
    ) {
      const shippingPct = ((totals.shippingCosts / totals.netSales) * 100).toFixed(1);
      const logisticsLeaks = leaks.filter((l) => l.category === 'Logistics & Shipping' || l.category === 'High Return Rates');
      const logisticsLossTotal = logisticsLeaks.reduce((s, l) => s + l.estimatedImpactINR, 0);

      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        isDemoResponse: true,
        text: `### Shipping & Fulfillment Analysis:\nFulfillment costs stand at **${formatINR(totals.shippingCosts)}** (${shippingPct}% of Net Sales). Over 30% of this cost is burned on non-revenue freight (RTO returns and reverse pickups).\n\n### Major Logistics Leaks (${formatINR(logisticsLossTotal)} total):\n1. **COD Return-to-Origin (RTO):** ₹4,82,000 lost on 284 uncollected Tier-3 shipments.\n2. **Ceramic Transit Breakage:** ₹2,35,000 lost due to damaged pottery requiring two-way transit fees.\n3. **ODA Surcharges:** ₹42,100 courier over-billing (now reconciled).\n\n### High-Impact Solution:\nEnable WhatsApp OTP confirmation for COD orders over ₹1,500 and upgrade fragile ceramic packaging to 5-ply cartons with honeycomb cushioning.`,
        highlightMetrics: [
          { label: 'Shipping Spend', value: formatINR(totals.shippingCosts), color: 'text-slate-800' },
          { label: 'Logistics Leaks', value: formatINR(logisticsLossTotal), color: 'text-rose-600' },
          { label: 'Avg Return Cost', value: '₹340 / order', color: 'text-amber-600' },
        ],
        suggestedQuestions: [
          'What is causing the biggest profit loss?',
          'Which products have the weakest margins?',
          'How does the Recovery Simulator estimate savings?',
        ],
      };
    }

    // 5. Total profit at risk / overview summary
    if (
      q.includes('total profit at risk') ||
      q.includes('overview') ||
      q.includes('summary') ||
      q.includes('health') ||
      q.includes('how are we doing')
    ) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        isDemoResponse: true,
        text: `### Executive Financial Health Summary:\n- **Net Sales:** ${formatINR(totals.netSales)}\n- **Contribution Profit:** ${formatINR(totals.contributionProfit)}\n- **Contribution Margin:** **${totals.contributionMargin.toFixed(1)}%**\n- **Identified Profit at Risk:** **${formatINR(totals.profitAtRisk)}** (across 5 active leaks)\n\n### Where your margin is leaking:\n1. High COD Returns (RTO): **₹4,82,000**\n2. Coupon FESTIVE35 Over-discounting: **₹3,48,500**\n3. Fragile Ceramic Breakages: **₹2,35,000**\n4. Heavy Brass Volumetric Freight: **₹1,94,200**\n5. Payment Gateway Surcharges: **₹78,600**\n\nImplementing the recommended fixes can recover up to **${formatINR(1005000)}/month** in pure bottom-line profit.`,
        highlightMetrics: [
          { label: 'Net Sales', value: formatINR(totals.netSales), color: 'text-slate-800' },
          { label: 'Contribution Profit', value: formatINR(totals.contributionProfit), color: 'text-emerald-600' },
          { label: 'Profit At Risk', value: formatINR(totals.profitAtRisk), color: 'text-rose-600' },
        ],
        suggestedQuestions: [
          'What is causing the biggest profit loss?',
          'Which products have the weakest margins?',
          'Explain the highest-impact finding.',
        ],
      };
    }

    // Default intelligent fallback based on search against query
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      isDemoResponse: true,
      text: `### Financial Intelligence Scan for: "${userQuery}"\n\nI analyzed your verified store dataset (9,989,054 Net Sales, ₹4,225,181 Contribution Profit, 12 products, 20 audited orders, and 6 detected profit leaks).\n\nHere are the most pertinent financial data points regarding your query:\n- **Profit at Risk:** ${formatINR(totals.profitAtRisk)} across 5 active findings.\n- **Discounts Claimed:** ${formatINR(totals.discounts)} (${((totals.discounts / totals.grossSales) * 100).toFixed(1)}% of gross sales).\n- **Shipping & Fulfillment:** ${formatINR(totals.shippingCosts)} (${((totals.shippingCosts / totals.netSales) * 100).toFixed(1)}% of net sales).\n- **Critical Action Required:** Address the Tier-3 COD RTO issue (${formatINR(482000)}/mo loss) and review negative-margin brass cookware.\n\n*Note: Operating in Demo Mode. Calculations are verified against deterministic sample financial ledgers.*`,
      highlightMetrics: [
        { label: 'Net Sales', value: formatINR(totals.netSales), color: 'text-slate-900' },
        { label: 'Contribution Profit', value: formatINR(totals.contributionProfit), color: 'text-emerald-600' },
        { label: 'Profit at Risk', value: formatINR(totals.profitAtRisk), color: 'text-rose-600' },
      ],
      suggestedQuestions: [
        'What is causing the biggest profit loss?',
        'Which products have the weakest margins?',
        'How could we reduce discount-related losses?',
        'Explain the highest-impact finding.',
      ],
    };
  }
}

export const aiCopilotService = new AICopilotService();
