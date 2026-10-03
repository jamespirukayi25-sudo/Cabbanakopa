import React, { useState, useEffect } from "react";
import {
  Car,
  ShieldCheck,
  Check,
  Sparkles,
  Zap,
  Clock,
  CreditCard,
  Building2,
  Crown,
  Info,
  Phone,
  ArrowRight,
  X,
  AlertCircle,
  HelpCircle,
  BadgePercent,
  CheckCircle2,
  Smartphone,
  MapPin,
  FileText
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  FleetSubscriptionTier,
  FleetPlanId,
  ActiveFleetSubscription
} from "../types";

const STORAGE_KEY = "harare_fleet_subscription";

export const FLEET_PLANS: FleetSubscriptionTier[] = [
  {
    id: "trial_1day",
    name: "1-Day Free Trial",
    tagline: "Test live vehicle tracking on the Harare map with zero commitment",
    priceUSD: 0,
    priceZiG: 0,
    billingPeriod: "1_day_free",
    badge: "100% FREE • 24 HOURS",
    maxVehicles: "Up to 2 Vehicles",
    recommendedFor: "Individual car, taxi, and kombi owners exploring the platform",
    ctaText: "Activate 1-Day Free Trial",
    features: [
      { title: "Live vehicle location on interactive Harare map", highlight: true },
      { title: "Real-time congestion & bottleneck alerts", highlight: true },
      { title: "Printable QR windscreen sticker generator" },
      { title: "EcoCash / InnBucks test transit pay sandbox" },
      { title: "24-hour access with no credit card required", highlight: true },
      { title: "Traffic Marshall emergency dispatch hotline" }
    ]
  },
  {
    id: "owner_pro",
    name: "Kombi & Taxi Owner Pro",
    tagline: "Essential tracking, route monitoring, and passenger escrow for private operators",
    priceUSD: 4.99,
    priceZiG: 150,
    billingPeriod: "monthly",
    badge: "BEST FOR SINGLE VEHICLES",
    maxVehicles: "Up to 5 Vehicles",
    recommendedFor: "Kombi, taxi, private shuttle, and courier delivery car owners",
    ctaText: "Subscribe Owner Pro",
    features: [
      { title: "Continuous 24/7 GPS telemetry on live map", highlight: true },
      { title: "Geofence departure & corridor route deviation alerts", highlight: true },
      { title: "Automated passenger escrow fare collection" },
      { title: "Speed limit breach & driver safety scores" },
      { title: "Official Harare Safe Transit digital certificate" },
      { title: "Daily revenue & commuter passenger ledger" }
    ]
  },
  {
    id: "fleet_enterprise",
    name: "Car Company & Fleet Enterprise",
    tagline: "Comprehensive bird's-eye fleet control room for transport companies and operators",
    priceUSD: 14.99,
    priceZiG: 450,
    billingPeriod: "monthly",
    isPopular: true,
    badge: "MOST POPULAR FOR FLEETS",
    maxVehicles: "Unlimited Vehicles",
    recommendedFor: "Commuter omnibus fleets, car rental companies, logistics syndicates",
    ctaText: "Select Fleet Enterprise",
    features: [
      { title: "Centralized live fleet control room map with multi-vehicle tracking", highlight: true },
      { title: "Automated escrow split with instant EcoCash/InnBucks daily driver payouts", highlight: true },
      { title: "Kombi rank queue coordination & terminal dwell time analytics", highlight: true },
      { title: "Priority traffic controller dispatch for fleet breakdowns/gridlock", highlight: true },
      { title: "Driver mutual rating audit trail & passenger feedback log" },
      { title: "Full RBZ NPS Act compliance reports & downloadable IMTT tax exports" }
    ]
  },
  {
    id: "syndicate_custom",
    name: "Transport Syndicate / Association",
    tagline: "Tailored multi-depot deployment with hardware telemetry integrations",
    priceUSD: 9.99,
    priceZiG: 300,
    billingPeriod: "custom",
    badge: "VOLUME SYNDICATE",
    maxVehicles: "20+ Vehicles",
    recommendedFor: "Greater Harare transport syndicates, corporate fleets, and franchises",
    ctaText: "Contact Syndicate Desk",
    features: [
      { title: "Volume pricing ($9.99/vehicle for 20+ units)", highlight: true },
      { title: "Custom GPS OBD-II & tracker API webhooks", highlight: true },
      { title: "Dedicated rank marshall coordination channel" },
      { title: "SLA guarantee with 24/7 dedicated dispatch manager" },
      { title: "Multi-depot shift scheduling & fuel burn tracking" },
      { title: "Custom white-labeled commuter QR codes" }
    ]
  }
];

interface FleetPricingTableProps {
  onPlanActivated?: (subscription: ActiveFleetSubscription) => void;
  onNavigateToMap?: () => void;
}

export const FleetPricingTable: React.FC<FleetPricingTableProps> = ({
  onPlanActivated,
  onNavigateToMap
}) => {
  const [currency, setCurrency] = useState<"USD" | "ZiG">("USD");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [activeSubscription, setActiveSubscription] = useState<ActiveFleetSubscription | null>(null);
  
  // Modal State
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<FleetSubscriptionTier | null>(null);
  const [modalStep, setModalStep] = useState<"form" | "confirming" | "success">("form");
  const [ownerName, setOwnerName] = useState("Farai Munemo");
  const [ownerPhone, setOwnerPhone] = useState("+263 77 312 8904");
  const [vehicleReg, setVehicleReg] = useState("AEB 4920");
  const [paymentMethod, setPaymentMethod] = useState<"EcoCash" | "InnBucks" | "OneMoney" | "Card">("EcoCash");
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Load existing subscription from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ActiveFleetSubscription = JSON.parse(saved);
        // Check if trial has expired
        const now = new Date().getTime();
        const expires = new Date(parsed.expiresAt).getTime();
        if (now > expires && parsed.status === "trial_active") {
          parsed.status = "expired";
        }
        setActiveSubscription(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleOpenPlanModal = (plan: FleetSubscriptionTier) => {
    setSelectedPlanForModal(plan);
    setModalStep("form");
  };

  const handleActivatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForModal) return;

    setModalStep("confirming");

    setTimeout(() => {
      const now = new Date();
      // 1 day = 24 hours, monthly = 30 days
      const durationHours = selectedPlanForModal.id === "trial_1day" ? 24 : 30 * 24;
      const expiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000).toISOString();

      const newSub: ActiveFleetSubscription = {
        planId: selectedPlanForModal.id,
        planName: selectedPlanForModal.name,
        status: selectedPlanForModal.id === "trial_1day" ? "trial_active" : "subscribed",
        activatedAt: now.toISOString(),
        expiresAt: expiresAt,
        vehicleReg: vehicleReg.trim().toUpperCase() || "AEB 4920",
        ownerName: ownerName.trim() || "Vehicle Owner",
        ownerPhone: ownerPhone.trim() || "+263 77 000 0000",
        paymentMethod: paymentMethod,
        autoRenew: selectedPlanForModal.id !== "trial_1day"
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSub));
      } catch {
        // ignore
      }

      setActiveSubscription(newSub);
      setModalStep("success");
      onPlanActivated?.(newSub);

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }, 900);
  };

  const handleCancelSubscription = () => {
    if (window.confirm("Are you sure you want to deactivate your active fleet tracking pass?")) {
      localStorage.removeItem(STORAGE_KEY);
      setActiveSubscription(null);
    }
  };

  // Calculate remaining time for active subscription
  const getRemainingTimeStr = () => {
    if (!activeSubscription) return "";
    const diff = new Date(activeSubscription.expiresAt).getTime() - new Date().getTime();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m remaining`;
  };

  return (
    <div className="space-y-6" id="fleet-pricing-container">
      {/* Active Subscription Banner (if any) */}
      {activeSubscription && (
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-amber-950/40 border border-emerald-500/40 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {activeSubscription.status === "trial_active" ? "1-Day Free Trial Active" : "Subscribed"}
                </span>
                <span className="text-xs font-bold text-white">{activeSubscription.planName}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Vehicle: <strong className="text-amber-400">{activeSubscription.vehicleReg}</strong> • Owner:{" "}
                <strong className="text-slate-200">{activeSubscription.ownerName}</strong> ({activeSubscription.ownerPhone})
              </p>
              <p className="text-[11px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {getRemainingTimeStr()} (Valid until {new Date(activeSubscription.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {onNavigateToMap && (
              <button
                type="button"
                onClick={onNavigateToMap}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Track on Map</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCancelSubscription}
              className="px-3 py-2 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 rounded-xl text-xs transition cursor-pointer border border-slate-700 hover:border-rose-700/50"
              title="Deactivate plan or switch vehicle"
            >
              Reset / Change
            </button>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Vehicle Owners & Car Companies
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                1-Day Free Trial Available
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              Fleet & Vehicle Owner Subscription Plans
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Real-time map visibility, live GPS tracking, unauthorized detour geofencing, and automated passenger escrow collections tailored for Harare commuter omnibus operators, car hire, and private vehicle owners.
            </p>
          </div>

          {/* Currency & Billing Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Currency Selector */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  currency === "USD" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency("ZiG")}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  currency === "ZiG" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                ZiG (Gold)
              </button>
            </div>

            {/* Billing Cycle Selector */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  billingCycle === "monthly" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                  billingCycle === "yearly" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Annual</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.2 rounded-full">
                  -15%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Currency rate advisory banner */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Official interbank pegged multiplier: <strong>1 USD = 30 ZiG</strong>. Statutory 2% IMTT applies only on billable renewals.</span>
          </div>
          <span className="hidden sm:inline font-mono text-[10px] text-slate-500">RBZ Compliant</span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {FLEET_PLANS.map((plan) => {
          const isTrial = plan.id === "trial_1day";
          const isEnterprise = plan.isPopular;
          const isCurrentlyActive = activeSubscription?.planId === plan.id && activeSubscription.status !== "expired";

          // Calculate displayed price
          let displayPrice = "";
          let unitLabel = "";
          if (isTrial) {
            displayPrice = currency === "USD" ? "$0.00" : "0 ZiG";
            unitLabel = "for 24 hours";
          } else if (plan.billingPeriod === "custom") {
            displayPrice = currency === "USD" ? "$9.99+" : "300+ ZiG";
            unitLabel = "/ vehicle / mo";
          } else {
            const basePrice = currency === "USD" ? plan.priceUSD : plan.priceZiG;
            const finalPrice = billingCycle === "yearly" ? +(basePrice * 0.85).toFixed(2) : basePrice;
            displayPrice = currency === "USD" ? `$${finalPrice}` : `${Math.round(finalPrice)} ZiG`;
            unitLabel = plan.id === "fleet_enterprise" ? "/ vehicle / mo" : "/ month";
          }

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl flex flex-col justify-between transition-all duration-200 ${
                isTrial
                  ? "bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/70 shadow-lg shadow-amber-500/10"
                  : isEnterprise
                  ? "bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-950 border-2 border-emerald-500/70 shadow-lg shadow-emerald-500/10"
                  : "bg-slate-900/80 border border-slate-800 hover:border-slate-700"
              } p-4 sm:p-5`}
            >
              {/* Top Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={`text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                      isTrial
                        ? "bg-amber-400 text-slate-950 font-black animate-pulse"
                        : isEnterprise
                        ? "bg-emerald-400 text-slate-950 font-black"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {isTrial && <Zap className="w-3 h-3 fill-current" />}
                    {isEnterprise && <Crown className="w-3 h-3 fill-current" />}
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Card Header */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-base font-bold text-white leading-snug">
                    {plan.name}
                  </h4>
                  {isTrial ? (
                    <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                      <Clock className="w-4 h-4" />
                    </div>
                  ) : isEnterprise ? (
                    <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                      <Building2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-1.5 bg-slate-800 text-slate-400 rounded-lg">
                      <Car className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-400 min-h-[36px] leading-relaxed">
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {displayPrice}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {unitLabel}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-400/90 font-semibold mt-0.5">
                    Capacity: {plan.maxVehicles}
                  </div>
                </div>

                {/* Features List */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    What's Included:
                  </span>
                  <ul className="space-y-2 text-xs">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div
                          className={`mt-0.5 rounded-full p-0.5 shrink-0 ${
                            feat.highlight
                              ? isTrial
                                ? "bg-amber-500 text-slate-950 font-bold"
                                : "bg-emerald-500 text-slate-950 font-bold"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span
                          className={`leading-snug ${
                            feat.highlight ? "text-slate-100 font-medium" : "text-slate-400"
                          }`}
                        >
                          {feat.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer / Call to Action */}
              <div className="pt-5 mt-4 border-t border-slate-800/80 space-y-2">
                <button
                  type="button"
                  onClick={() => handleOpenPlanModal(plan)}
                  disabled={isCurrentlyActive}
                  className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                    isCurrentlyActive
                      ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 cursor-default"
                      : isTrial
                      ? "bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-slate-950 font-black shadow-amber-500/20"
                      : isEnterprise
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black shadow-emerald-500/20"
                      : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600"
                  }`}
                >
                  {isCurrentlyActive ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Current Plan Active</span>
                    </>
                  ) : (
                    <>
                      <span>{plan.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <div className="text-[10px] text-center text-slate-500 leading-tight">
                  {isTrial
                    ? "Instant access • No credit card required"
                    : "EcoCash / InnBucks instant USSD authorization"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust, Guarantee & Regulatory Compliance Footer */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-bold text-white">Instant 1-Day Activation</h5>
            <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">
              Begin tracking your vehicle immediately without card pre-authorization. Switch or upgrade whenever your business expands.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-bold text-white">RBZ Regulated Escrow</h5>
            <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">
              Commuter transit funds are secured under the Reserve Bank of Zimbabwe NPS Act with transparent 2% IMTT tax reporting.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-bold text-white">Direct Mobile Money Payouts</h5>
            <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">
              Instant driver settlements through EcoCash and InnBucks USSD prompts without cumbersome bank transfer delays.
            </p>
          </div>
        </div>
      </div>

      {/* Activation / Subscription Modal */}
      {selectedPlanForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative space-y-4 my-8">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedPlanForModal(null)}
              className="absolute top-4 right-4 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {modalStep === "form" && (
              <form onSubmit={handleActivatePlan} className="space-y-4">
                {/* Header */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        selectedPlanForModal.id === "trial_1day"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {selectedPlanForModal.badge || "Subscription Setup"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedPlanForModal.id === "trial_1day"
                      ? "Start Your 1-Day Free Trial"
                      : `Activate ${selectedPlanForModal.name}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedPlanForModal.id === "trial_1day"
                      ? "Get full 24-hour access to live Harare GPS map tracking with zero charges and no credit card required."
                      : `Register your fleet for continuous real-time telemetry, geofencing, and transit escrow.`}
                  </p>
                </div>

                {/* Plan Summary Card */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Selected Plan</span>
                    <strong className="text-white text-sm">{selectedPlanForModal.name}</strong>
                    <span className="text-slate-400 block text-[11px]">{selectedPlanForModal.maxVehicles}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Due Today</span>
                    <strong className="text-emerald-400 text-base font-mono font-bold">
                      {selectedPlanForModal.id === "trial_1day"
                        ? "$0.00 USD (FREE)"
                        : `$${selectedPlanForModal.priceUSD} USD / mo`}
                    </strong>
                  </div>
                </div>

                {/* Inputs */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Primary Vehicle Registration / Fleet ID *
                    </label>
                    <div className="relative">
                      <Car className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={vehicleReg}
                        onChange={(e) => setVehicleReg(e.target.value)}
                        placeholder="e.g. AEB 4920 or Kombi Fleet #12"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] text-slate-500">Quick suggestions:</span>
                      {["AEB 4920", "ABZ 8812", "AFX 2049"].map((reg) => (
                        <button
                          key={reg}
                          type="button"
                          onClick={() => setVehicleReg(reg)}
                          className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                        >
                          {reg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Owner / Company Name *
                      </label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="e.g. Farai Munemo"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Mobile Number (EcoCash / WhatsApp) *
                      </label>
                      <input
                        type="tel"
                        value={ownerPhone}
                        onChange={(e) => setOwnerPhone(e.target.value)}
                        placeholder="+263 77..."
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Payment Preference for Future Renewals */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {selectedPlanForModal.id === "trial_1day"
                        ? "Preferred Channel for Optional Renewal (No charge today)"
                        : "Payment Gateway *"}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "EcoCash", label: "EcoCash" },
                        { id: "InnBucks", label: "InnBucks" },
                        { id: "OneMoney", label: "OneMoney" },
                        { id: "Card", label: "Visa/Master" }
                      ].map((gw) => (
                        <button
                          key={gw.id}
                          type="button"
                          onClick={() => setPaymentMethod(gw.id as any)}
                          className={`py-2 px-2.5 rounded-xl border text-center transition cursor-pointer ${
                            paymentMethod === gw.id
                              ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {gw.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <label className="flex items-start gap-2 pt-1 text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      required
                      className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-800"
                    />
                    <span className="text-[11px] leading-tight">
                      I agree to the Harare Traffic Network fleet terms and acknowledge that 1-day free trial telemetry is valid for 24 hours from activation.
                    </span>
                  </label>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanForModal(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!termsAccepted}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {selectedPlanForModal.id === "trial_1day"
                        ? "Confirm & Activate 24h Free Trial"
                        : "Confirm Subscription"}
                    </span>
                  </button>
                </div>
              </form>
            )}

            {modalStep === "confirming" && (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
                <h4 className="text-base font-bold text-white">Activating Fleet Telemetry Token...</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Registering vehicle {vehicleReg} with the Harare Live Traffic Map and configuring automated geofence corridor alerts.
                </p>
              </div>
            )}

            {modalStep === "success" && (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    Telemetry Token #HAR-FLT-2026
                  </span>
                  <h4 className="text-lg font-bold text-white">
                    {selectedPlanForModal.id === "trial_1day"
                      ? "1-Day Free Trial Activated!"
                      : "Fleet Subscription Active!"}
                  </h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto">
                    Vehicle <strong className="text-amber-400">{vehicleReg}</strong> is now live on the interactive Harare network map. Your 24-hour pass expires at{" "}
                    <strong>
                      {activeSubscription && new Date(activeSubscription.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </strong>.
                  </p>
                </div>

                {/* Quick Info */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-left space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>Assigned Vehicle:</span>
                    <strong className="text-slate-200">{vehicleReg}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Owner Contact:</span>
                    <strong className="text-slate-200">{ownerPhone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <strong className="text-emerald-400">Live GPS Visible</strong>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlanForModal(null);
                      onNavigateToMap?.();
                    }}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>View Vehicle on Map</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlanForModal(null)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
