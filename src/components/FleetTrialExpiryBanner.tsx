import React, { useState, useEffect } from "react";
import {
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Car,
  X,
  ChevronDown,
  RotateCcw
} from "lucide-react";
import { ActiveFleetSubscription } from "../types";

interface FleetTrialExpiryBannerProps {
  subscription: ActiveFleetSubscription | null;
  onNavigateToPricing: () => void;
  onExtendDemoHours?: (hours: number) => void;
}

export const FleetTrialExpiryBanner: React.FC<FleetTrialExpiryBannerProps> = ({
  subscription,
  onNavigateToPricing,
  onExtendDemoHours
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [now, setNow] = useState<number>(Date.now());
  const [showDemoTimeSelector, setShowDemoTimeSelector] = useState(false);

  // Update timer tick every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!subscription) {
    return null;
  }

  const expiresTime = new Date(subscription.expiresAt).getTime();
  const diffMs = expiresTime - now;
  const isExpired = diffMs <= 0;
  const totalHoursLeft = diffMs / (1000 * 60 * 60);

  // Requirement: Notify fleet owners when their '1 day free trial' or subscription is within 24 hours of expiring
  const isWithin24Hours = totalHoursLeft <= 24;

  if (!isWithin24Hours && !isExpired) {
    return null;
  }

  // Calculate formatted countdown
  const hours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const minutes = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));

  const isTrial = subscription.status === "trial_active" || subscription.planId === "trial_1day";

  // If user dismissed it, provide a compact floating reactivation chip so it remains accessible
  if (isDismissed) {
    return (
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[450] pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          className="bg-slate-900/95 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-500/50 px-3 py-1.5 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 backdrop-blur-md transition cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>{isTrial ? "1-Day Free Trial Alert" : "Subscription Alert"}:</span>
          <span className="font-mono text-white bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
            {isExpired ? "Expired" : `${hours}h ${minutes}m left`}
          </span>
          <span className="text-amber-400 font-extrabold text-[10px] underline ml-1">Show Warning</span>
        </button>
      </div>
    );
  }

  // Progress percentage (assuming 24h cycle)
  const percentRemaining = Math.max(0, Math.min(100, (diffMs / (24 * 60 * 60 * 1000)) * 100));

  return (
    <div
      id="fleet-trial-expiry-banner"
      className={`w-full z-[450] border-b transition-all duration-300 shadow-xl ${
        isExpired
          ? "bg-gradient-to-r from-red-950 via-slate-900 to-red-950/80 border-red-500/40"
          : "bg-gradient-to-r from-amber-950/90 via-slate-950 to-amber-950/70 border-amber-500/40"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5 sm:py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Indicator & Vehicle Details */}
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${
              isExpired
                ? "bg-red-500/20 text-red-400 border-red-500/40"
                : "bg-amber-500/20 text-amber-400 border-amber-500/40"
            }`}
          >
            {isExpired ? (
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            ) : (
              <Clock className="w-5 h-5 animate-bounce" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isExpired
                    ? "bg-red-500/20 text-red-300 border-red-500/30"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                }`}
              >
                {isExpired
                  ? "Access Expired"
                  : isTrial
                  ? "1-Day Free Trial Expiring Soon"
                  : "Fleet Plan Expiring Within 24 Hours"}
              </span>

              {/* Countdown badge */}
              <div
                className={`flex items-center gap-1 text-xs font-mono font-extrabold px-2 py-0.5 rounded ${
                  isExpired
                    ? "bg-red-900/60 text-red-200 border border-red-700/50"
                    : "bg-amber-900/60 text-amber-200 border border-amber-600/50"
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>{isExpired ? "0h 0m (Trial Expired)" : `${hours}h ${minutes}m Remaining`}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-1 leading-snug">
              Vehicle <strong className="font-mono text-amber-300 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-700">{subscription.vehicleReg}</strong>
              {" "}(Owner: <span className="text-white font-medium">{subscription.ownerName}</span>)
              {" "}
              {isExpired
                ? "live GPS corridor tracking is currently suspended. Upgrade to keep live telemetry."
                : isTrial
                ? "will lose live GPS map tracking and priority controller dispatch once the 24-hour trial completes."
                : "subscription is in its final 24 hours. Renew your plan to avoid telemetry interruption."}
            </p>
          </div>
        </div>

        {/* Right: Direct Link to Fleet Pricing Table & Actions */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end shrink-0 pt-1 sm:pt-0">
          {/* Quick Demo Selector for Reviewers */}
          {onExtendDemoHours && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDemoTimeSelector(!showDemoTimeSelector)}
                className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-[10px] font-mono border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                title="Simulate different remaining trial countdowns"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Simulate Time</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showDemoTimeSelector && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl z-50 text-xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-wider">
                    Simulate Expiry:
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onExtendDemoHours(2);
                      setShowDemoTimeSelector(false);
                    }}
                    className="w-full text-left px-2 py-1 hover:bg-amber-500/20 text-amber-300 rounded text-[11px] font-mono"
                  >
                    ⏰ 2 hours left
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onExtendDemoHours(8);
                      setShowDemoTimeSelector(false);
                    }}
                    className="w-full text-left px-2 py-1 hover:bg-amber-500/20 text-amber-300 rounded text-[11px] font-mono"
                  >
                    ⏰ 8 hours left
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onExtendDemoHours(23);
                      setShowDemoTimeSelector(false);
                    }}
                    className="w-full text-left px-2 py-1 hover:bg-amber-500/20 text-amber-300 rounded text-[11px] font-mono"
                  >
                    ⏰ 23 hours left
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onExtendDemoHours(-0.5);
                      setShowDemoTimeSelector(false);
                    }}
                    className="w-full text-left px-2 py-1 hover:bg-red-500/20 text-red-300 rounded text-[11px] font-mono"
                  >
                    🚨 Expired (-30m)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Primary CTA: Directly Links to the Fleet Pricing Table */}
          <button
            type="button"
            onClick={onNavigateToPricing}
            className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/20 cursor-pointer group"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950 group-hover:rotate-12 transition-transform" />
            <span>{isExpired ? "Choose a Fleet Plan" : "Upgrade to Fleet Plan"}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtle Progress Bar showing time left in the 24-hour window */}
      <div className="w-full bg-slate-900/90 h-1 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            isExpired
              ? "bg-red-500 w-full"
              : percentRemaining < 20
              ? "bg-red-500"
              : percentRemaining < 50
              ? "bg-amber-500"
              : "bg-emerald-500"
          }`}
          style={{ width: `${isExpired ? 100 : percentRemaining}%` }}
        />
      </div>
    </div>
  );
};
