/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  NavigationTab, 
  DateRange, 
  ProfitLeak, 
  Product, 
  Order, 
  FinancialTotals, 
  OrganizationInfo, 
  LeakStatus 
} from './types';
import { apiClient, localDemoStore } from './services/apiClient';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { DemoModeBanner } from './components/common/DemoModeBanner';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { OverviewPage } from './components/overview/OverviewPage';
import { ProfitLeaksPage } from './components/leaks/ProfitLeaksPage';
import { ProductsPage } from './components/products/ProductsPage';
import { OrdersPage } from './components/orders/OrdersPage';
import { RecoverySimulatorPage } from './components/simulator/RecoverySimulatorPage';
import { AICopilotPage } from './components/copilot/AICopilotPage';
import { SettingsPage } from './components/settings/SettingsPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Modals & drawers
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Cross-entity selection targets
  const [selectedLeakId, setSelectedLeakId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Core financial state
  const [totals, setTotals] = useState<FinancialTotals>(localDemoStore.getTotals());
  const [leaks, setLeaks] = useState<ProfitLeak[]>(localDemoStore.getLeaks());
  const [products, setProducts] = useState<Product[]>(localDemoStore.getProducts());
  const [orders, setOrders] = useState<Order[]>(localDemoStore.getOrders());
  const [organization, setOrganization] = useState<OrganizationInfo>(localDemoStore.getOrg());
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Keyboard shortcut Cmd+K or Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check backend health on initial load
  useEffect(() => {
    apiClient.checkHealth().then((health) => {
      setIsBackendConnected(health.connected);
    });
  }, []);

  // Update leak status with real-time state recalculation
  const handleUpdateLeakStatus = (leakId: string, newStatus: LeakStatus, note?: string) => {
    apiClient.updateLeakStatus(leakId, newStatus, note);
    // Refresh local state
    setLeaks([...localDemoStore.getLeaks()]);
    setTotals({ ...localDemoStore.getTotals() });
  };

  // Reset demo state
  const handleResetData = () => {
    localDemoStore.resetToDefaults();
    setLeaks([...localDemoStore.getLeaks()]);
    setTotals({ ...localDemoStore.getTotals() });
    setProducts([...localDemoStore.getProducts()]);
    setOrders([...localDemoStore.getOrders()]);
  };

  // Navigation router helper
  const handleNavigate = (tab: NavigationTab, targetId?: string) => {
    setCurrentTab(tab);
    if (tab === 'leaks' && targetId) {
      setSelectedLeakId(targetId);
    } else if (tab === 'products' && targetId) {
      setSelectedProductId(targetId);
    } else if (tab === 'orders' && targetId) {
      setSelectedOrderId(targetId);
    }
  };

  const openLeaksCount = leaks.filter((l) => l.status === 'Open').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Demo Banner */}
      <DemoModeBanner 
        onOpenSettings={() => setCurrentTab('settings')}
        isBackendConnected={isBackendConnected}
      />

      <div className="flex-1 flex w-full">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onNavigate={(tab) => {
            setCurrentTab(tab);
            setSelectedLeakId(null);
            setSelectedProductId(null);
            setSelectedOrderId(null);
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          openLeaksCount={openLeaksCount}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopHeader
            currentTab={currentTab}
            onNavigate={setCurrentTab}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
            openLeaksCount={openLeaksCount}
            isBackendConnected={isBackendConnected}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {currentTab === 'overview' && (
              <OverviewPage
                totals={totals}
                leaks={leaks}
                onNavigate={handleNavigate}
                dateRange={dateRange}
              />
            )}

            {currentTab === 'leaks' && (
              <ProfitLeaksPage
                leaks={leaks}
                onUpdateStatus={handleUpdateLeakStatus}
                selectedLeakId={selectedLeakId}
                onClearSelectedLeak={() => setSelectedLeakId(null)}
                onNavigateToSimulator={() => setCurrentTab('simulator')}
                onNavigateToProducts={(name) => {
                  setCurrentTab('products');
                }}
              />
            )}

            {currentTab === 'products' && (
              <ProductsPage
                products={products}
                onNavigateToSimulator={() => setCurrentTab('simulator')}
                onNavigateToLeaks={() => setCurrentTab('leaks')}
                selectedProductId={selectedProductId}
                onClearSelectedProduct={() => setSelectedProductId(null)}
              />
            )}

            {currentTab === 'orders' && (
              <OrdersPage
                orders={orders}
                selectedOrderId={selectedOrderId}
                onClearSelectedOrder={() => setSelectedOrderId(null)}
              />
            )}

            {currentTab === 'simulator' && (
              <RecoverySimulatorPage
                totals={totals}
                onNavigateToLeaks={() => setCurrentTab('leaks')}
              />
            )}

            {currentTab === 'copilot' && (
              <AICopilotPage
                onNavigateToLeak={(leakId) => handleNavigate('leaks', leakId)}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsPage
                organization={organization}
                onResetData={handleResetData}
              />
            )}
          </main>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
