import { 
  FinancialTotals, 
  Order, 
  Product, 
  ProfitLeak, 
  SimulationInputs, 
  SimulationResult, 
  OrganizationInfo, 
  LeakStatus 
} from '../types';
import { 
  SAMPLE_FINANCIAL_TOTALS, 
  SAMPLE_PRODUCTS, 
  SAMPLE_PROFIT_LEAKS, 
  SAMPLE_ORDERS, 
  SAMPLE_ORGANIZATION 
} from '../data/sampleData';
import { calculateRecoverySimulation } from '../utils/financialCalculations';

// Centralized API Base URL (defaults to FastAPI local backend http://127.0.0.1:8000)
export const API_BASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) 
    ? import.meta.env.VITE_API_BASE_URL 
    : 'http://127.0.0.1:8000';

export interface BackendHealth {
  connected: boolean;
  url: string;
  latencyMs?: number;
  lastChecked: Date;
  statusMessage: string;
}

/**
 * State store for frontend demo mode updates (e.g. updating leak statuses, etc.)
 * Ensures the app works smoothly in demo mode with full interactive feedback.
 */
class LocalDemoState {
  private leaks: ProfitLeak[] = JSON.parse(JSON.stringify(SAMPLE_PROFIT_LEAKS));
  private products: Product[] = JSON.parse(JSON.stringify(SAMPLE_PRODUCTS));
  private orders: Order[] = JSON.parse(JSON.stringify(SAMPLE_ORDERS));
  private org: OrganizationInfo = JSON.parse(JSON.stringify(SAMPLE_ORGANIZATION));
  private totals: FinancialTotals = JSON.parse(JSON.stringify(SAMPLE_FINANCIAL_TOTALS));

  getLeaks() { return this.leaks; }
  getProducts() { return this.products; }
  getOrders() { return this.orders; }
  getOrg() { return this.org; }
  getTotals() {
    // Recalculate profit at risk based on open/reviewing leaks
    const activeRisk = this.leaks
      .filter(l => l.status === 'Open' || l.status === 'Reviewing')
      .reduce((acc, l) => acc + l.estimatedImpactINR, 0);
    return { ...this.totals, profitAtRisk: activeRisk };
  }

  updateLeakStatus(leakId: string, newStatus: LeakStatus, userNote?: string): ProfitLeak | null {
    const leak = this.leaks.find(l => l.id === leakId);
    if (!leak) return null;

    leak.status = newStatus;
    leak.auditTrail.unshift({
      action: `Status changed to ${newStatus}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST',
      note: userNote || `User updated status to ${newStatus}`,
      user: 'Rithin (Merchant Admin)',
    });
    return leak;
  }

  resetToDefaults() {
    this.leaks = JSON.parse(JSON.stringify(SAMPLE_PROFIT_LEAKS));
    this.products = JSON.parse(JSON.stringify(SAMPLE_PRODUCTS));
    this.orders = JSON.parse(JSON.stringify(SAMPLE_ORDERS));
    this.totals = JSON.parse(JSON.stringify(SAMPLE_FINANCIAL_TOTALS));
  }
}

export const localDemoStore = new LocalDemoState();

export class ApiClient {
  private baseUrl: string;
  private isForceDemo: boolean = true; // Default true so app starts immediately with demo data

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  isDemoModeActive(): boolean {
    return this.isForceDemo;
  }

  setDemoMode(enabled: boolean) {
    this.isForceDemo = enabled;
  }

  /**
   * Probes the FastAPI /health or /api/v1/health endpoint
   */
  async checkHealth(): Promise<BackendHealth> {
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      const latencyMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        return {
          connected: true,
          url: this.baseUrl,
          latencyMs,
          lastChecked: new Date(),
          statusMessage: `Connected to FastAPI (${latencyMs}ms)`,
        };
      } else {
        return {
          connected: false,
          url: this.baseUrl,
          lastChecked: new Date(),
          statusMessage: `Server returned HTTP ${response.status}`,
        };
      }
    } catch {
      return {
        connected: false,
        url: this.baseUrl,
        lastChecked: new Date(),
        statusMessage: `Cannot reach FastAPI at ${this.baseUrl}. Using realistic Demo Mode.`,
      };
    }
  }

  async getFinancialTotals(): Promise<{ data: FinancialTotals; isDemo: boolean }> {
    if (this.isForceDemo) {
      return { data: localDemoStore.getTotals(), isDemo: true };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/financials/overview`);
      if (!res.ok) throw new Error('Live API error');
      const data = await res.json();
      return { data, isDemo: false };
    } catch {
      return { data: localDemoStore.getTotals(), isDemo: true };
    }
  }

  async getProfitLeaks(): Promise<{ data: ProfitLeak[]; isDemo: boolean }> {
    if (this.isForceDemo) {
      return { data: localDemoStore.getLeaks(), isDemo: true };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/leaks`);
      if (!res.ok) throw new Error('Live API error');
      const data = await res.json();
      return { data, isDemo: false };
    } catch {
      return { data: localDemoStore.getLeaks(), isDemo: true };
    }
  }

  async updateLeakStatus(leakId: string, status: LeakStatus, note?: string): Promise<{ data: ProfitLeak; isDemo: boolean }> {
    if (this.isForceDemo) {
      const updated = localDemoStore.updateLeakStatus(leakId, status, note);
      if (!updated) throw new Error('Finding not found');
      return { data: updated, isDemo: true };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/leaks/${leakId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      if (!res.ok) throw new Error('Live API update error');
      const data = await res.json();
      return { data, isDemo: false };
    } catch {
      const updated = localDemoStore.updateLeakStatus(leakId, status, note);
      if (!updated) throw new Error('Finding not found');
      return { data: updated, isDemo: true };
    }
  }

  async getProducts(): Promise<{ data: Product[]; isDemo: boolean }> {
    if (this.isForceDemo) {
      return { data: localDemoStore.getProducts(), isDemo: true };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/products`);
      if (!res.ok) throw new Error('Live API error');
      const data = await res.json();
      return { data, isDemo: false };
    } catch {
      return { data: localDemoStore.getProducts(), isDemo: true };
    }
  }

  async getOrders(): Promise<{ data: Order[]; isDemo: boolean }> {
    if (this.isForceDemo) {
      return { data: localDemoStore.getOrders(), isDemo: true };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/orders`);
      if (!res.ok) throw new Error('Live API error');
      const data = await res.json();
      return { data, isDemo: false };
    } catch {
      return { data: localDemoStore.getOrders(), isDemo: true };
    }
  }

  async runRecoverySimulation(inputs: SimulationInputs): Promise<{ data: SimulationResult; isDemo: boolean }> {
    // Financial simulator uses deterministic logic
    const baseline = localDemoStore.getTotals();
    const result = calculateRecoverySimulation(baseline, inputs);
    return { data: result, isDemo: this.isForceDemo };
  }

  async getOrganization(): Promise<{ data: OrganizationInfo; isDemo: boolean }> {
    return { data: localDemoStore.getOrg(), isDemo: this.isForceDemo };
  }
}

export const apiClient = new ApiClient();
