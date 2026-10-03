import React, { useState } from "react";
import {
  ShieldAlert,
  Users,
  Clock,
  Phone,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Plus,
  Sparkles,
  Loader2,
  Bike,
  Flame,
  Radio,
  MapPin,
  Car,
  Bus,
  Zap,
  Check,
  Star,
  RefreshCw
} from "lucide-react";
import {
  TrafficController,
  TrafficControllerRequest,
  ControllerDispatchStatus
} from "../types";

interface TrafficControllersHubProps {
  controllers: TrafficController[];
  requests: TrafficControllerRequest[];
  onRequestControllerClick: () => void;
  onUpdateStatus: (requestId: string, status: ControllerDispatchStatus, notes?: string) => Promise<void>;
  onRateController: (requestId: string, rating: number, feedback: string) => Promise<void>;
  onViewOnMap?: (coords: [number, number]) => void;
}

const STATUS_STEPS: { id: ControllerDispatchStatus; label: string; icon: string }[] = [
  { id: "requested", label: "Requested", icon: "📝" },
  { id: "assigned", label: "Assigned", icon: "👮‍♂️" },
  { id: "en_route", label: "En Route", icon: "🏍️" },
  { id: "on_scene", label: "On Scene", icon: "🚨" },
  { id: "clearing_traffic", label: "Clearing", icon: "✋" },
  { id: "resolved", label: "Cleared", icon: "✅" }
];

export const TrafficControllersHub: React.FC<TrafficControllersHubProps> = ({
  controllers,
  requests,
  onRequestControllerClick,
  onUpdateStatus,
  onRateController,
  onViewOnMap
}) => {
  const [selectedRequest, setSelectedRequest] = useState<TrafficControllerRequest | null>(null);
  const [filterCorridor, setFilterCorridor] = useState<string>("all");

  // AI manual directing tactical strategy generator state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStrategyResult, setAiStrategyResult] = useState<string | null>(null);
  const [targetIntersection, setTargetIntersection] = useState("Rotten Row & Jason Moyo Intersection");
  const [targetCorridor, setTargetCorridor] = useState("CBD Core & Ranks");
  const [targetCause, setTargetCause] = useState("Traffic lights (robots) dead, 4-way deadlock gridlock");

  // Rating modal state
  const [ratingRequestId, setRatingRequestId] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingFeedback, setRatingFeedback] = useState<string>("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Statistics
  const onDutyCount = controllers.filter((c) => c.status === "on_duty" || c.status === "on_scene").length;
  const activeRescues = requests.filter((r) => r.status !== "resolved" && r.status !== "cancelled").length;
  const totalCleared = controllers.reduce((acc, c) => acc + (c.intersectionsCleared || 0), 0);

  const filteredRequests = requests.filter((r) => {
    if (filterCorridor !== "all" && r.corridor !== filterCorridor) return false;
    return true;
  });

  const handleGenerateAiStrategy = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/traffic-controller-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intersection: targetIntersection,
          corridor: targetCorridor,
          congestionCause: targetCause,
          vehiclesWaiting: "80+ queued vehicles blocking intersection box"
        })
      });
      const data = await res.json();
      setAiStrategyResult(data.strategy);
    } catch (err) {
      console.error("AI strategy generation error:", err);
      setAiStrategyResult(
        "• Phase 1 (Clear Box): Station Lead Marshall at center. Halt all turns for 60s.\n• Phase 2 (Arterial Wave): Give Rotten Row a 90s continuous green wave.\n• Phase 3 (Kombi Queue Control): Marshall 2 holds Chinhoyi St feeder cut-ins."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleAdvanceStatus = async (req: TrafficControllerRequest) => {
    const currentIdx = STATUS_STEPS.findIndex((s) => s.id === req.status);
    if (currentIdx < STATUS_STEPS.length - 1) {
      const nextStatus = STATUS_STEPS[currentIdx + 1].id;
      let notes = req.dispatchOfficerNotes;
      if (nextStatus === "en_route") notes = "Officer riding rapid motorcycle, weaving through shoulder. ETA 3 mins.";
      if (nextStatus === "on_scene") notes = "Officer on scene with high-vis vest and whistle. Halting gridlocked turns.";
      if (nextStatus === "clearing_traffic") notes = "Pulsing priority arterial flow in 90-second cycles. Traffic unblocking.";
      if (nextStatus === "resolved") notes = "Intersection box cleared. Normal fluid traffic flow restored!";
      await onUpdateStatus(req.id, nextStatus, notes);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingRequestId) return;
    setIsSubmittingRating(true);
    try {
      await onRateController(ratingRequestId, ratingScore, ratingFeedback);
      setRatingRequestId(null);
      setRatingFeedback("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Top Hero Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
                Harare Traffic Controllers & Rapid Gridlock Dispatch
              </h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
                Active Standby Service
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              <strong>Stuck in gridlock? We offer certified traffic controllers.</strong> Whether traffic lights are dead, an accident is blocking the lane, or kombis are double-parked, our motorcycle marshalls deploy within minutes to manually direct traffic and restore flow.
            </p>
          </div>

          {/* Big SOS CTA */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onRequestControllerClick}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer transform hover:scale-102"
            >
              <ShieldAlert className="w-4 h-4 text-slate-950 animate-bounce" />
              <span>I'm Stuck in Traffic — Request Controller!</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Controllers On Duty</div>
              <div className="text-base font-black text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {onDutyCount} Officers
              </div>
            </div>
            <Users className="w-4 h-4 text-slate-500" />
          </div>

          <div className="bg-slate-950/80 border border-amber-900/40 rounded-xl p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-amber-300 font-bold uppercase">Active Gridlock Rescues</div>
              <div className="text-base font-black text-amber-400">{activeRescues} In Progress</div>
            </div>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Average Dispatch ETA</div>
              <div className="text-base font-black text-cyan-400">4 - 7 Mins</div>
            </div>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Intersections Unblocked</div>
              <div className="text-base font-black text-white">{totalCleared}+ Cleared</div>
            </div>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        
        {/* SECTION 1: LIVE GRIDLOCK RESCUE DISPATCHES */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <h3 className="text-sm sm:text-base font-black text-white">
                Live Traffic Controller Dispatches & Client Rescues
              </h3>
              <span className="text-xs text-slate-400 font-mono">({filteredRequests.length})</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterCorridor}
                onChange={(e) => setFilterCorridor(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Corridors</option>
                <option value="CBD Core & Ranks">CBD Core & Ranks</option>
                <option value="Seke Road Corridor">Seke Road Corridor</option>
                <option value="Bulawayo Road Corridor">Bulawayo Road Corridor</option>
                <option value="Lomagundi / Westgate Corridor">Lomagundi / Westgate Corridor</option>
              </select>

              <button
                onClick={onRequestControllerClick}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Request</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredRequests.map((req) => {
              const isResolved = req.status === "resolved";
              const assigned = req.assignedController;

              return (
                <div
                  key={req.id}
                  className={`bg-slate-950/90 border rounded-2xl p-4 space-y-3 transition shadow-lg ${
                    req.status === "on_scene"
                      ? "border-amber-500 shadow-amber-500/5 ring-1 ring-amber-500/20"
                      : req.status === "en_route"
                      ? "border-cyan-500/50"
                      : isResolved
                      ? "border-slate-800 opacity-80"
                      : "border-slate-700"
                  }`}
                >
                  {/* Top: Location & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-white">{req.location}</span>
                        <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800">
                          {req.corridor}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Client: <strong className="text-slate-200">{req.clientName}</strong> ({req.clientVehicle})
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 flex items-center gap-1 ${
                        req.status === "on_scene"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                          : req.status === "en_route"
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                          : isResolved
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {req.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Jam Reason and Notes */}
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 text-xs space-y-1">
                    <div className="text-slate-300 font-medium">
                      ⚠️ <strong>Cause:</strong> {req.notes || req.congestionCause}
                    </div>
                    {req.dispatchOfficerNotes && (
                      <div className="text-[11px] text-amber-300/90 italic pt-0.5">
                        💬 <strong>Officer Note:</strong> {req.dispatchOfficerNotes}
                      </div>
                    )}
                  </div>

                  {/* Assigned Officer Strip */}
                  {assigned && (
                    <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                          👮‍♂️
                        </div>
                        <div>
                          <div className="font-bold text-white leading-none">{assigned.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            #{assigned.badgeNumber} • {assigned.vehicleType?.replace("_", " ")}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {assigned.phone && (
                          <a
                            href={`tel:${assigned.phone}`}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                        )}
                        {req.coords && onViewOnMap && (
                          <button
                            onClick={() => onViewOnMap(req.coords!)}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
                            title="View location on map"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress Lifecycle Stepper */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Dispatch Progress:</span>
                      <span className="font-bold text-amber-400 capitalize">{req.status.replace("_", " ")}</span>
                    </div>

                    <div className="grid grid-cols-6 gap-1">
                      {STATUS_STEPS.map((step, idx) => {
                        const currentIdx = STATUS_STEPS.findIndex((s) => s.id === req.status);
                        const isDone = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div
                            key={step.id}
                            className={`h-1.5 rounded-full transition-all ${
                              isCurrent
                                ? "bg-amber-400 animate-pulse"
                                : isDone
                                ? "bg-emerald-500"
                                : "bg-slate-800"
                            }`}
                            title={step.label}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
                    <span className="text-[10px] text-slate-500">{req.requestedAt}</span>

                    <div className="flex items-center gap-1.5">
                      {!isResolved ? (
                        <button
                          onClick={() => handleAdvanceStatus(req)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] rounded-xl transition flex items-center gap-1 cursor-pointer shadow-sm"
                          title="Advance to next controller response stage"
                        >
                          <span>Simulate Next Stage</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Gridlock Cleared
                          </span>
                          {!req.rating ? (
                            <button
                              onClick={() => setRatingRequestId(req.id)}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-[10px] rounded-lg transition border border-amber-500/30 cursor-pointer"
                            >
                              Rate Officer ⭐
                            </button>
                          ) : (
                            <span className="text-[11px] text-amber-400 font-bold">
                              ★ {req.rating}/5
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: ON-DUTY HARARE TRAFFIC CONTROLLERS ROSTER */}
        <div className="space-y-2.5 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Certified On-Duty Traffic Controllers Roster</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Rapid Response Network
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Trained marshalls equipped with high-visibility gear, illuminated wands, and motorcycle rapid transit.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {controllers.map((c) => {
              const isOnDuty = c.status === "on_duty" || c.status === "on_scene";
              return (
                <div
                  key={c.id}
                  className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-3.5 space-y-2.5 transition shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 font-black text-lg flex items-center justify-center">
                        👮‍♂️
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-extrabold text-white">{c.name}</div>
                        <div className="text-[11px] text-amber-400 font-mono">
                          Badge #{c.badgeNumber}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        c.status === "on_scene"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : c.status === "on_duty"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="text-slate-300">
                      <strong className="text-slate-400">Station:</strong> {c.station}
                    </div>
                    <div className="text-slate-300">
                      <strong className="text-slate-400">Current Post:</strong> {c.currentIntersection}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Bike className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="capitalize">{c.vehicleType?.replace("_", " ")}</span>
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {c.intersectionsCleared} Intersections Cleared
                      </span>
                    </div>
                  </div>

                  {/* Equipment Pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {c.equipment.map((eq, i) => (
                      <span
                        key={i}
                        className="text-[9px] bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>

                  {/* Footer hotline */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{c.rating} Rating</span>
                    </div>

                    <a
                      href={`tel:${c.phone}`}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-[11px] rounded-xl border border-slate-700 transition flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{c.phone}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: AI TACTICAL DE-BOTTLENECK STRATEGY GENERATOR */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-white">
                  AI Tactical Manual Directing Protocol Generator
                </h4>
                <p className="text-xs text-slate-400">
                  Generate on-scene manual wave instructions for controllers unblocking complex Harare deadlocks.
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateAiStrategy}
              disabled={aiLoading}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing Directing Protocol...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Directing Protocol</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Target Intersection</label>
              <input
                type="text"
                value={targetIntersection}
                onChange={(e) => setTargetIntersection(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Corridor</label>
              <input
                type="text"
                value={targetCorridor}
                onChange={(e) => setTargetCorridor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400">Congestion Root Cause</label>
              <input
                type="text"
                value={targetCause}
                onChange={(e) => setTargetCause(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {aiStrategyResult && (
            <div className="mt-3 p-4 bg-slate-950 border border-amber-500/30 rounded-xl text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
              {aiStrategyResult}
            </div>
          )}
        </div>
      </div>

      {/* RATING MODAL */}
      {ratingRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h4 className="text-base font-extrabold text-white">Rate Traffic Controller Service</h4>
            <p className="text-xs text-slate-400">
              Your review helps maintain high standards for Harare's community traffic wardens.
            </p>

            <form onSubmit={handleSubmitRating} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Star Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setRatingScore(score)}
                      className={`p-2 rounded-xl border text-base font-black transition cursor-pointer ${
                        ratingScore >= score
                          ? "bg-amber-500 text-slate-950 border-amber-400"
                          : "bg-slate-950 text-slate-500 border-slate-800"
                      }`}
                    >
                      ★ {score}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Feedback / Comments</label>
                <textarea
                  rows={3}
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                  placeholder="e.g. Officer arrived quickly, cleared the double-parked vehicles and got traffic moving in 5 mins!"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingRequestId(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRating}
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 text-xs font-black rounded-xl"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
