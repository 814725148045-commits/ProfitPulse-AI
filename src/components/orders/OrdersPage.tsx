import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  ArrowUpDown, 
  X, 
  CheckCircle2, 
  RotateCcw, 
  Truck, 
  Clock, 
  ChevronRight, 
  Eye, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus, SalesChannel } from '../../types';
import { formatINR } from '../../utils/financialCalculations';

interface OrdersPageProps {
  orders: Order[];
  selectedOrderId?: string | null;
  onClearSelectedOrder?: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  orders,
  selectedOrderId,
  onClearSelectedOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [channelFilter, setChannelFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'gross' | 'profit'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    if (selectedOrderId) {
      return orders.find((o) => o.id === selectedOrderId) || null;
    }
    return null;
  });

  React.useEffect(() => {
    if (selectedOrderId) {
      const match = orders.find((o) => o.id === selectedOrderId);
      if (match) setActiveOrder(match);
    }
  }, [selectedOrderId, orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        searchQuery === '' ||
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
      const matchesChannel = channelFilter === 'All' || o.channel === channelFilter;

      return matchesSearch && matchesStatus && matchesChannel;
    }).sort((a, b) => {
      if (sortBy === 'date') {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      }
      if (sortBy === 'gross') {
        return sortOrder === 'desc' ? b.grossAmount - a.grossAmount : a.grossAmount - b.grossAmount;
      }
      if (sortBy === 'profit') {
        return sortOrder === 'desc' ? b.contributionProfit - a.contributionProfit : a.contributionProfit - b.contributionProfit;
      }
      return 0;
    });
  }, [orders, searchQuery, statusFilter, channelFilter, sortBy, sortOrder]);

  const statuses: OrderStatus[] = ['Delivered', 'Returned', 'Refunded', 'In Transit'];
  const channels: SalesChannel[] = ['Shopify Store', 'Amazon India', 'Direct Store'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Orders & Returns Ledger
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
              {orders.length} Audited Sample Orders
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Individual transaction order economics showing gross amounts, coupons, returns, logistics fees, and profit.
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID, customer name, city, or item..."
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

          {/* Status & Channel */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-[11px] font-medium text-slate-400 mr-1.5">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="All">All Statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Channel */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-[11px] font-medium text-slate-400 mr-1.5">Channel:</span>
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="All">All Channels</option>
                {channels.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-[11px] font-medium text-slate-400 mr-1.5">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-semibold text-slate-700 text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="date">Date</option>
                <option value="gross">Gross Amount</option>
                <option value="profit">Contribution Profit</option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg px-2.5 py-1.5 text-slate-600 font-medium transition cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>{sortOrder === 'desc' ? 'Desc' : 'Asc'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
          <span>Showing <strong className="text-slate-700">{filteredOrders.length}</strong> orders</span>
          {(searchQuery || statusFilter !== 'All' || channelFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setChannelFilter('All');
              }}
              className="text-blue-600 hover:underline font-medium cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer & City</th>
                <th className="py-3.5 px-4">Channel / Status</th>
                <th className="py-3.5 px-4 text-right">Gross</th>
                <th className="py-3.5 px-4 text-right">Discount</th>
                <th className="py-3.5 px-4 text-right">Refund</th>
                <th className="py-3.5 px-4 text-right">Shipping</th>
                <th className="py-3.5 px-4 text-right">Payment Fee</th>
                <th className="py-3.5 px-4 text-right">Contrib. Profit</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((o) => {
                const isLoss = o.contributionProfit < 0;
                const isSelected = activeOrder?.id === o.id;

                return (
                  <tr
                    key={o.id}
                    onClick={() => setActiveOrder(o)}
                    className={`hover:bg-slate-50/80 transition cursor-pointer ${
                      isSelected ? 'bg-blue-50/50' : isLoss ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    {/* Order ID & Date */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 font-mono">
                        {o.orderNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {o.date}
                      </div>
                    </td>

                    {/* Customer & City */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800">
                        {o.customerName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {o.customerCity}, {o.customerState}
                      </div>
                    </td>

                    {/* Channel & Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-[11px] font-medium text-slate-600 mb-1">
                        {o.channel} • {o.paymentMode}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[10px] ${
                          o.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.status === 'Returned' || o.isRTO
                            ? 'bg-rose-100 text-rose-800'
                            : o.status === 'Refunded'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {o.status === 'Delivered' && <CheckCircle2 className="w-3 h-3" />}
                        {o.status === 'Returned' && <RotateCcw className="w-3 h-3" />}
                        {o.status === 'In Transit' && <Truck className="w-3 h-3" />}
                        {o.status === 'Refunded' && <Clock className="w-3 h-3" />}
                        {o.isRTO ? 'Returned (RTO)' : o.status}
                      </span>
                    </td>

                    {/* Gross */}
                    <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-medium text-slate-900">
                      {formatINR(o.grossAmount)}
                    </td>

                    {/* Discount */}
                    <td className="py-4 px-4 text-right whitespace-nowrap font-mono">
                      {o.discountAmount > 0 ? (
                        <span className="text-amber-700">-{formatINR(o.discountAmount)}</span>
                      ) : (
                        <span className="text-slate-300">₹0</span>
                      )}
                    </td>

                    {/* Refund */}
                    <td className="py-4 px-4 text-right whitespace-nowrap font-mono">
                      {o.refundAmount > 0 ? (
                        <span className="text-rose-600 font-bold">-{formatINR(o.refundAmount)}</span>
                      ) : (
                        <span className="text-slate-300">₹0</span>
                      )}
                    </td>

                    {/* Shipping */}
                    <td className="py-4 px-4 text-right whitespace-nowrap font-mono text-slate-600">
                      {formatINR(o.shippingCost)}
                    </td>

                    {/* Payment Fee */}
                    <td className="py-4 px-4 text-right whitespace-nowrap font-mono text-slate-600">
                      {formatINR(o.paymentFee)}
                    </td>

                    {/* Contribution Profit */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-mono font-bold text-xs ${
                          isLoss ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {formatINR(o.contributionProfit)}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveOrder(o);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="View order audit ledger"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Order Audit Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {activeOrder.orderNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      activeOrder.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {activeOrder.isRTO ? 'Returned RTO' : activeOrder.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed on {activeOrder.date} via {activeOrder.channel} ({activeOrder.paymentMode})
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveOrder(null);
                  if (onClearSelectedOrder) onClearSelectedOrder();
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs text-slate-600">
              {/* Customer info */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-800">{activeOrder.customerName}</div>
                  <div className="text-[11px] text-slate-500">{activeOrder.customerCity}, {activeOrder.customerState}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">Payment Rail</span>
                  <span className="font-semibold text-slate-700">{activeOrder.paymentMode}</span>
                </div>
              </div>

              {/* Items List */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Purchased Items ({activeOrder.itemsCount})
                </div>
                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          SKU: {item.sku} • Qty: {item.quantity}
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-slate-800">
                        {formatINR(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Deductions Waterfall (No double counting) */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Deterministic Financial Waterfall
                </div>

                <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 space-y-2 font-mono">
                  <div className="flex justify-between text-slate-800 font-sans">
                    <span>Gross Order Value</span>
                    <span className="font-bold font-mono">{formatINR(activeOrder.grossAmount)}</span>
                  </div>

                  {activeOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-amber-700 text-[11px] font-sans">
                      <span>Less: Discount ({activeOrder.discountCode || 'Promo'})</span>
                      <span className="font-mono">-{formatINR(activeOrder.discountAmount)}</span>
                    </div>
                  )}

                  {activeOrder.refundAmount > 0 && (
                    <div className="flex justify-between text-rose-700 text-[11px] font-sans">
                      <span>Less: Sales Refund</span>
                      <span className="font-mono font-bold">-{formatINR(activeOrder.refundAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-blue-900 font-sans font-bold pt-1 border-t border-slate-200">
                    <span>Net Sales Realized</span>
                    <span className="font-mono">{formatINR(activeOrder.netSales)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600 text-[11px] font-sans pt-1">
                    <span>Less: Product COGS</span>
                    <span className="font-mono text-rose-600">-{formatINR(activeOrder.cogs)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600 text-[11px] font-sans">
                    <span>Less: Courier Shipping Cost</span>
                    <span className="font-mono text-rose-600">-{formatINR(activeOrder.shippingCost)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600 text-[11px] font-sans">
                    <span>Less: Payment Processing Fee</span>
                    <span className="font-mono text-rose-600">-{formatINR(activeOrder.paymentFee)}</span>
                  </div>

                  {activeOrder.otherVariableCost > 0 && (
                    <div className="flex justify-between text-slate-600 text-[11px] font-sans">
                      <span>Less: Return/Packaging Inspection</span>
                      <span className="font-mono text-rose-600">-{formatINR(activeOrder.otherVariableCost)}</span>
                    </div>
                  )}

                  <div
                    className={`flex justify-between font-sans font-bold text-sm pt-2 border-t-2 ${
                      activeOrder.contributionProfit < 0
                        ? 'border-rose-300 text-rose-700'
                        : 'border-emerald-300 text-emerald-800'
                    }`}
                  >
                    <span>Contribution Profit</span>
                    <span className="font-mono">{formatINR(activeOrder.contributionProfit)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => {
                  setActiveOrder(null);
                  if (onClearSelectedOrder) onClearSelectedOrder();
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
