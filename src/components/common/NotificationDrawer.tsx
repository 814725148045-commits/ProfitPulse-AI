import React, { useState } from 'react';
import { Bell, Check, X, AlertTriangle, ShieldCheck, TrendingDown, Sparkles } from 'lucide-react';
import { SAMPLE_ACTIVITY_FEED } from '../../data/sampleData';
import { NavigationTab } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [notifications, setNotifications] = useState(
    SAMPLE_ACTIVITY_FEED.map((n) => ({ ...n, isRead: false }))
  );

  if (!isOpen) return null;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Notifications & Alerts</h3>
              <p className="text-[11px] text-slate-500">{unreadCount} unread activity events</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 border-b border-slate-100 flex justify-between items-center text-xs px-4">
          <span className="text-slate-500 text-[11px]">Real-time margin anomaly alerts</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifications.map((item) => {
            const isAlert = item.type === 'alert';
            const isResolution = item.type === 'resolution';
            const isSimulation = item.type === 'simulation';

            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  item.isRead ? 'bg-slate-50/60 border-slate-100' : 'bg-white border-blue-100 shadow-xs'
                } hover:border-blue-300`}
                onClick={() => {
                  if (item.type === 'simulation') onNavigate('simulator');
                  else onNavigate('leaks');
                  onClose();
                }}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      isAlert
                        ? 'bg-rose-100 text-rose-600'
                        : isResolution
                        ? 'bg-emerald-100 text-emerald-600'
                        : isSimulation
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {isAlert && <AlertTriangle className="w-3.5 h-3.5" />}
                    {isResolution && <ShieldCheck className="w-3.5 h-3.5" />}
                    {isSimulation && <Sparkles className="w-3.5 h-3.5" />}
                    {!isAlert && !isResolution && !isSimulation && <TrendingDown className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-slate-400">{item.time}</span>
                      <span
                        className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                          isAlert
                            ? 'bg-rose-50 text-rose-600'
                            : isResolution
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 text-xs mt-1">{item.title}</div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={() => {
              onNavigate('leaks');
              onClose();
            }}
            className="w-full py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            View All Audit Logs & Leaks
          </button>
        </div>
      </div>
    </div>
  );
};
