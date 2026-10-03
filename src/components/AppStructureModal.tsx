import React from "react";
import {
  X,
  MapPin,
  Video,
  Bus,
  Car,
  Users,
  ShoppingBag,
  ShieldAlert,
  Lightbulb,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Sparkles,
  Building2,
  Lock,
  Compass,
  LayoutGrid,
  Calculator,
  Gauge,
  PackageSearch,
  Briefcase
} from "lucide-react";

interface AppStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (
    topic: "ranks" | "driver_intel" | "commuter" | "fleet",
    page: "kombi" | "fare_calc" | "cameras" | "map" | "intel" | "routes" | "controllers" | "shift_tracker" | "rides" | "lost_found" | "payments" | "jobs" | "spares" | "fleet_pricing" | "qr"
  ) => void;
}

export const AppStructureModal: React.FC<AppStructureModalProps> = ({
  isOpen,
  onClose,
  onSelectPage
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 p-4 sm:p-6 flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-black uppercase px-2 py-0.5 rounded-full border border-amber-500/30">
                  Public Transport Hub
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Kombi Drivers • Conductors • Commuters</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Harare Transport All-Pages Directory
              </h2>
              <p className="text-xs text-slate-400">
                Direct access to all 4 transport topics and 16 operational sub-pages.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Core Topics Grid */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* TOPIC 1: KOMBI TERMINALS & RANKS */}
            <div className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between transition group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black">
                    <Bus className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Topic 1
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-white group-hover:text-amber-300 transition">
                    Kombi Terminals
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                    Live queues, CBD departure boards, fare calculator & CCTV.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-900 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPage("ranks", "kombi");
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Bus className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Page 1: CBD Departure Board</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectPage("ranks", "fare_calc");
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">Page 2: Fare & Change Calc</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectPage("ranks", "cameras");
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">Page 3: Live CCTV Feeds</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectPage("ranks", "map");
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">Page 4: Route & Rank Map</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    onSelectPage("ranks", "kombi");
                    onClose();
                  }}
                  className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Open Terminals</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* TOPIC 2: DRIVER ROAD INTEL & HAZARDS */}
            <div className="bg-slate-950/90 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 flex flex-col justify-between transition group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-black">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Topic 2
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-white group-hover:text-blue-300 transition">
                    Driver Road Alerts
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                    Police roadblocks, potholes, bypass detours & shift tracker.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-900 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPage("driver_intel", "intel");
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-blue-500/20 text-slate-300 hover:text-blue-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">Page 1: Driver Roadblock Intel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectPage("driver_intel", "routes");
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-blue-500/20 text-slate-300 hover:text-blue-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Page 2: Detour Bypass Routes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectPage("driver_intel", "shift_tracker");
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-blue-500/20 text-slate-300 hover:text-blue-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Gauge className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">Page 3: Daily Target & Fuel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectPage("driver_intel", "controllers");
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-blue-500/20 text-slate-300 hover:text-blue-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="truncate">Page 4: Traffic Marshalls</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    onSelectPage("driver_intel", "intel");
                    onClose();
                  }}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Open Road Intel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* TOPIC 3: COMMUTER RIDES & HAILING */}
            <div className="bg-slate-950/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col justify-between transition group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black">
                    <Car className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Topic 3
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition">
                    Commuter Rides
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                    Passenger kombi hailing, shared lifts & lost property board.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-900 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPage("commuter", "rides");
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Car className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Page 1: Passenger Hailing</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectPage("commuter", "lost_found");
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    <PackageSearch className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">Page 2: Kombi Lost & Found</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectPage("commuter", "fare_calc");
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">Page 3: Commuter Fare Calculator</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectPage("commuter", "payments");
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">Page 4: Digital Fare Escrow</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    onSelectPage("commuter", "rides");
                    onClose();
                  }}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Open Commute</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* TOPIC 4: KOMBI JOBS, SPARES & FLEET */}
            <div className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between transition group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Topic 4 • Fleet
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-white group-hover:text-amber-300 transition">
                    Kombi Jobs & Fleet
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                    Class 2 driver hiring, HiAce/Quantum spares, tracking & QR.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-900 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPage("fleet", "jobs");
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">Page 1: Kombi Driver Hiring</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectPage("fleet", "spares");
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Page 2: Kombi Spares & Vehicles</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectPage("fleet", "fleet_pricing");
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">Page 3: Fleet Telematics (1-Day Free)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectPage("fleet", "qr");
                      onClose();
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">Page 4: Printable Car & Stop QRs</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    onSelectPage("fleet", "jobs");
                    onClose();
                  }}
                  className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Open Kombi Jobs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
