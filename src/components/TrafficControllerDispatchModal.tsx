import React, { useState } from "react";
import {
  ShieldAlert,
  X,
  Phone,
  Clock,
  Car,
  Bus,
  AlertTriangle,
  Zap,
  CheckCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  LifeBuoy
} from "lucide-react";
import {
  CongestionCause,
  TrafficController,
  TrafficControllerRequest
} from "../types";

interface TrafficControllerDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSubmitted: (request: Partial<TrafficControllerRequest>) => Promise<any>;
  prefilledLocation?: string;
  prefilledCorridor?: string;
  prefilledCoords?: [number, number];
  activeRequest?: TrafficControllerRequest | null;
}

const HARARE_BOTTLENECK_PRESETS = [
  {
    name: "Rotten Row & Jason Moyo Intersection",
    corridor: "CBD Core & Ranks",
    cause: "robots_dead" as CongestionCause,
    desc: "Robots down, 4-way deadlock gridlock near Magistrate Court"
  },
  {
    name: "Copacabana Rank Exit (Chinhoyi St)",
    corridor: "CBD Core & Ranks",
    cause: "kombi_bottleneck" as CongestionCause,
    desc: "Double-parked pirate taxis blocking omnibus outflow"
  },
  {
    name: "Seke Road Flyover (Dieppe / Cripps Jct)",
    corridor: "Seke Road Corridor",
    cause: "accident_gridlock" as CongestionCause,
    desc: "Narrow choke-point, vehicles overlapping onto dirt verge"
  },
  {
    name: "Westgate Roundabout (Lomagundi Road)",
    corridor: "Lomagundi / Westgate Corridor",
    cause: "rush_hour_deadlock" as CongestionCause,
    desc: "Heavy 4-artery ring deadlock with vehicles stuck in circle"
  },
  {
    name: "Simon Muzenda (4th St) & Robert Mugabe",
    corridor: "CBD Core & Ranks",
    cause: "kombi_bottleneck" as CongestionCause,
    desc: "Omnibus loading queue blocking through-lane toward Eastlea"
  },
  {
    name: "Bulawayo Road & Rekayi Tangwena (Showgrounds)",
    corridor: "Bulawayo Road Corridor",
    cause: "narrow_bridge" as CongestionCause,
    desc: "Flyover bottle-necking all inbound traffic from Warren Park"
  }
];

const CONGESTION_CAUSES: { id: CongestionCause; label: string; icon: React.ElementType }[] = [
  { id: "robots_dead", label: "Traffic Lights (Robots) Dead / Flashing", icon: AlertTriangle },
  { id: "accident_gridlock", label: "Accident / Disabled Vehicle in Lane", icon: ShieldAlert },
  { id: "kombi_bottleneck", label: "Kombi / Taxi Overlap & Double Parking", icon: Bus },
  { id: "rush_hour_deadlock", label: "4-Way Box Gridlock (Nobody Giving Way)", icon: Zap },
  { id: "narrow_bridge", label: "Narrow Choke-Point / Bridge Crawl", icon: Car },
  { id: "other", label: "General Road Blockage / Other", icon: LifeBuoy }
];

export const TrafficControllerDispatchModal: React.FC<TrafficControllerDispatchModalProps> = ({
  isOpen,
  onClose,
  onRequestSubmitted,
  prefilledLocation = "",
  prefilledCorridor = "CBD Core & Ranks",
  prefilledCoords,
  activeRequest
}) => {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientVehicle, setClientVehicle] = useState("Private Motorist (Sedan)");
  const [location, setLocation] = useState(prefilledLocation);
  const [corridor, setCorridor] = useState(prefilledCorridor);
  const [congestionCause, setCongestionCause] = useState<CongestionCause>("robots_dead");
  const [notes, setNotes] = useState("");
  const [urgency, setUrgency] = useState<"critical" | "high" | "moderate">("high");
  const [supportContribution, setSupportContribution] = useState<number>(0); // 0 = Free community dispatch

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchedResult, setDispatchedResult] = useState<TrafficControllerRequest | null>(
    activeRequest || null
  );

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof HARARE_BOTTLENECK_PRESETS[0]) => {
    setLocation(preset.name);
    setCorridor(preset.corridor);
    setCongestionCause(preset.cause);
    setNotes(preset.desc);
    setUrgency("high");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !location.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await onRequestSubmitted({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim() || "+263 77 123 4567",
        clientVehicle: clientVehicle.trim(),
        location: location.trim(),
        corridor,
        congestionCause,
        notes: notes.trim() || "Traffic standstill. Requesting traffic controller to direct intersection.",
        urgency,
        coords: prefilledCoords,
        feeUSD: supportContribution,
        feeZiG: supportContribution * 30
      });

      if (created) {
        setDispatchedResult(created);
      }
    } catch (err) {
      console.error("Failed to request traffic controller:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl shadow-amber-500/10 p-4 sm:p-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Stuck in Traffic? Request a Traffic Controller
                </h3>
              </div>
              <p className="text-xs text-amber-300/90 font-medium">
                Rapid Harare Traffic Wardens & Intersection Marshall Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* IF ALREADY DISPATCHED: SHOW ACTIVE TRACKER CARD */}
        {dispatchedResult ? (
          <div className="space-y-4 py-2">
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 flex items-center gap-1.5 animate-pulse">
                  <Zap className="w-3.5 h-3.5" />
                  Traffic Controller Dispatched!
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Ticket #{dispatchedResult.id.slice(-6).toUpperCase()}
                </span>
              </div>

              {/* Status and ETA */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Current Status</span>
                  <span className="text-sm font-extrabold text-amber-400 capitalize flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    {dispatchedResult.status.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimated Arrival (ETA)</span>
                  <span className="text-sm font-extrabold text-emerald-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {dispatchedResult.etaMinutes === 0 ? "On Scene Now!" : `~${dispatchedResult.etaMinutes} minutes`}
                  </span>
                </div>
              </div>

              {/* Assigned Officer Details */}
              {dispatchedResult.assignedController ? (
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 space-y-2">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Assigned Traffic Controller
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-sm flex items-center justify-center">
                        👮‍♂️
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-white">
                          {dispatchedResult.assignedController.name}
                        </div>
                        <div className="text-[11px] text-amber-400 font-mono">
                          Badge #{dispatchedResult.assignedController.badgeNumber} •{" "}
                          <span className="text-slate-300 capitalize">
                            {dispatchedResult.assignedController.vehicleType?.replace("_", " ") || "Rapid Unit"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={`tel:${dispatchedResult.assignedController.phone}`}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Controller</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">
                  Central dispatch is assigning the nearest sector marshal...
                </div>
              )}

              {/* Location and Officer Notes */}
              <div className="space-y-1 text-xs">
                <div className="text-slate-300">
                  <strong className="text-slate-400">Intersection:</strong> {dispatchedResult.location}
                </div>
                <div className="text-slate-300">
                  <strong className="text-slate-400">Client:</strong> {dispatchedResult.clientName} ({dispatchedResult.clientVehicle})
                </div>
                {dispatchedResult.dispatchOfficerNotes && (
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-amber-200 text-xs">
                    💬 <strong>Dispatch Note:</strong> {dispatchedResult.dispatchOfficerNotes}
                  </div>
                )}
              </div>

              {/* Service guarantee note */}
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-950/50 p-2 rounded-lg">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  Equipped with high-visibility gear, acoustic whistles, and certified intersection clearing protocols.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                onClick={() => setDispatchedResult(null)}
                className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
              >
                ← Submit Another Request
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close & Track on Map
              </button>
            </div>
          </div>
        ) : (
          /* REQUEST FORM */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Quick 1-Tap Harare Hotspot Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Quick 1-Tap Harare Gridlock Hotspots
                </span>
                <span className="text-[10px] text-slate-400">Click to autofill</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {HARARE_BOTTLENECK_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="p-2 bg-slate-950/90 hover:bg-amber-950/30 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left transition cursor-pointer space-y-0.5"
                  >
                    <div className="text-xs font-bold text-slate-200 line-clamp-1">{p.name}</div>
                    <div className="text-[10px] text-amber-400/80 line-clamp-1">{p.corridor}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Client Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Your Name / Contact Person <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Farai Ndlovu, Dr. Moyo"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Mobile Number (For Marshall Calls) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+263 77 ••• ••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Vehicle Type & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Your Vehicle Type</label>
                <select
                  value={clientVehicle}
                  onChange={(e) => setClientVehicle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="Private Motorist (Sedan / SUV)">🚗 Private Motorist (Sedan / SUV)</option>
                  <option value="Kombi Operator (16 Passengers)">🚐 Kombi Operator (16+ Passengers)</option>
                  <option value="Commuter / Passenger in Bus">🚌 Commuter / Passenger in Public Transit</option>
                  <option value="Delivery / Commercial Truck">🚚 Delivery / Commercial Transport</option>
                  <option value="Emergency / Doctor / Vital Shift">🚨 Doctor / Emergency Shift Worker</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Urgency Level</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: "critical", label: "Critical (>30m)", color: "border-rose-500 text-rose-300 bg-rose-950/40" },
                    { id: "high", label: "High Standstill", color: "border-amber-500 text-amber-300 bg-amber-950/40" },
                    { id: "moderate", label: "Slow Crawl", color: "border-slate-600 text-slate-300 bg-slate-900" }
                  ].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUrgency(u.id as any)}
                      className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition cursor-pointer text-center ${
                        urgency === u.id ? `${u.color} ring-1 ring-amber-400 font-black` : "border-slate-800 text-slate-500 bg-slate-950"
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Location & Corridor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Exact Bottleneck / Intersection <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Rotten Row & Jason Moyo Intersection"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Corridor / Area</label>
                <select
                  value={corridor}
                  onChange={(e) => setCorridor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="CBD Core & Ranks">CBD Core & Central Ranks</option>
                  <option value="Seke Road Corridor">Seke Road Corridor</option>
                  <option value="Bulawayo Road Corridor">Bulawayo Road Corridor</option>
                  <option value="Samora Machel / Mutare Rd">Samora Machel / Mutare Rd</option>
                  <option value="Lomagundi / Westgate Corridor">Lomagundi / Westgate Corridor</option>
                  <option value="Borrowdale / North Corridor">Borrowdale / North Corridor</option>
                  <option value="High Glen / Glen View Corridor">High Glen / Glen View Corridor</option>
                </select>
              </div>
            </div>

            {/* Reason for Congestion */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">
                Reason for the Jam
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {CONGESTION_CAUSES.map((c) => {
                  const Icon = c.icon;
                  const isSelected = congestionCause === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCongestionCause(c.id)}
                      className={`p-2 rounded-xl border text-left text-xs transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-500/80 text-amber-200 font-bold"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-amber-400" : "text-slate-500"}`} />
                      <span className="line-clamp-1">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">
                Additional Notes / Visual Landmark
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Broken down white bus in middle lane, please send warden to wave traffic through outer shoulder..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Voluntary Marshall Fuel / Support Contribution */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Traffic Warden Service Option</span>
                  <span className="text-[10px] text-slate-400">
                    Community wardens operate free of charge. Optional fuel token speeds up motorcycle dispatch.
                  </span>
                </div>
                <span className="text-xs font-black text-amber-400">
                  {supportContribution === 0 ? "FREE (Community)" : `$${supportContribution} USD / ZiG ${(supportContribution * 30)}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { value: 0, label: "Free Community Service" },
                  { value: 1, label: "+$1 Fuel Token" },
                  { value: 2, label: "+$2 Priority Fuel" }
                ].map((tier) => (
                  <button
                    key={tier.value}
                    type="button"
                    onClick={() => setSupportContribution(tier.value)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      supportContribution === tier.value
                        ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !clientName.trim() || !location.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Controller...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>Dispatch Traffic Controller Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
