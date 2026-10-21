export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type LeakCategory = 
  | 'Excessive Discounting'
  | 'High Return Rates'
  | 'Logistics & Shipping'
  | 'Payment Gateway Fees'
  | 'Low Margin SKUs';

export type LeakStatus = 'Open' | 'Reviewing' | 'Resolved' | 'Dismissed';

export type OrderStatus = 'Delivered' | 'Returned' | 'Refunded' | 'In Transit';

export type SalesChannel = 'Shopify Store' | 'Amazon India' | 'Quick Commerce' | 'Direct Store';

export type MarginHealth = 'healthy' | 'caution' | 'critical';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number; // Unit gross selling price (₹)
  unitsSold: number;
  grossSales: number;
  discounts: number;
  refunds: number;
  netSales: number;
  cogs: number; // Unit cost
  cogsTotal: number;
  shippingTotal: number;
  paymentFeesTotal: number;
  otherVariableTotal: number;
  contributionProfit: number;
  contributionMargin: number; // percentage (e.g., 28.4%)
  returnRate: number; // percentage (e.g., 18.2%)
  marginStatus: MarginHealth;
  description: string;
  reasonsForLeak?: string[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerCity: string;
  customerState: string;
  date: string;
  status: OrderStatus;
  channel: SalesChannel;
  items: OrderItem[];
  itemsCount: number;
  grossAmount: number;
  discountAmount: number;
  discountCode?: string;
  refundAmount: number;
  cogs: number;
  shippingCost: number;
  paymentFee: number;
  otherVariableCost: number;
  netSales: number;
  contributionProfit: number;
  isRTO: boolean; // Return to Origin
  paymentMode: 'UPI' | 'Credit Card' | 'Net Banking' | 'COD';
}

export interface CalculationStep {
  label: string;
  amount: number;
  description: string;
  isNegative?: boolean;
}

export interface AuditRecord {
  action: string;
  timestamp: string;
  note: string;
  user: string;
}

export interface ProfitLeak {
  id: string;
  title: string;
  category: LeakCategory;
  severity: SeverityLevel;
  estimatedImpactINR: number;
  status: LeakStatus;
  detectedDate: string;
  affectedCount: number;
  affectedProducts: string[];
  summary: string;
  rootCause: string;
  calculationBreakdown: CalculationStep[];
  recommendedActions: string[];
  potentialMonthlyRecoveryINR: number;
  auditTrail: AuditRecord[];
}

export interface SimulationInputs {
  discountReductionPct: number; // 0 to 50%
  refundRateReductionPct: number; // 0 to 60%
  shippingCostOptimizationPct: number; // 0 to 30%
  paymentFeeOptimizationPct: number; // 0 to 40%
  eliminateNegativeMarginSkus: boolean;
}

export interface SimulationResult {
  baselineNetSales: number;
  simulatedNetSales: number;
  netSalesDelta: number;
  baselineProfit: number;
  simulatedProfit: number;
  profitDelta: number;
  baselineMargin: number;
  simulatedMargin: number;
  marginDelta: number;
  annualizedSavings: number;
  savingsBreakdown: {
    discountsSaved: number;
    refundsPrevented: number;
    shippingSaved: number;
    gatewayFeesSaved: number;
    skuRationalizationGain: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  isDemoResponse: boolean;
  highlightMetrics?: { label: string; value: string; color?: string }[];
  suggestedQuestions?: string[];
  relatedLeakId?: string;
}

export type DateRange = '7d' | '30d' | '90d' | '12m' | 'ytd';

export type NavigationTab = 
  | 'overview' 
  | 'leaks' 
  | 'products' 
  | 'orders' 
  | 'simulator' 
  | 'copilot' 
  | 'settings';

export interface OrganizationInfo {
  name: string;
  brandTagline: string;
  gstin: string;
  reportingCurrency: 'INR' | 'USD';
  fiscalYear: string;
  primaryStore: string;
  activeIntegrations: {
    shopify: boolean;
    amazon: boolean;
    shiprocket: boolean;
    razorpay: boolean;
  };
}

export interface FinancialTotals {
  grossSales: number;
  discounts: number;
  refunds: number;
  netSales: number;
  cogs: number;
  shippingCosts: number;
  paymentFees: number;
  otherVariableCosts: number;
  contributionProfit: number;
  contributionMargin: number;
  profitAtRisk: number;
  negativeMarginLoss: number;
}

