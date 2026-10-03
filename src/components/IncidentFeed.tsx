import React, { useState } from "react";
import {
  AlertTriangle,
  Shield,
  Flame,
  HelpCircle,
  Video,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Compass,
  PlusCircle,
  Search,
  CheckCircle2,
  ArrowRight,
  Clock,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { Incident, IncidentType, SeverityLevel, VerificationStatus } from "../types";
import { POPULAR_LOCATIONS } from "../data/harareData";

interface IncidentFeedProps {
  incidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
  selectedIncident: Incident | null;
  onValidateIncident?: (id: string) => void;
  onRefuteIncident?: (id: string) => void;
  onUpvoteIncident?: (id: string) => void;
  onReportIncident: (newInc: Partial<Incident>) => void;
  onViewAlternateRoute: (inc: Incident) => void;
  onOpenVideo: (inc: Incident) => void;
  onRequestControllerForIncident?: (inc: Incident) => void;
}

export const IncidentFeed: React.FC<IncidentFeedProps> = ({
  incidents,
  onSelectIncident,
  selectedIncident,
  onValidateIncident,
  onRefuteIncident,
  onUpvoteIncident,
  onReportIncident,
  onViewAlternateRoute,
  onOpenVideo,
  onRequestControllerForIncident,
}) => {
  const [filter, setFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  // New report form state
  const [reportType, setReportType] = useState<IncidentType>("congestion");
  const [reportTitle, setReportTitle] = useState("");
  const [reportLocation, setReportLocation] = useState("");
  const [reportSeverity, setReportSeverity] = useState<SeverityLevel>("high");
  const [reportDesc, setReportDesc] = useState("");
  const [reportRole, setReportRole] = useState("Daily Commuter");
  const [reportAlternate, setReportAlternate] = useState("");
  const [reportHasVideo, setReportHasVideo] = useState(false);
  const [reportVideoUrl, setReportVideoUrl] = useState("");

  const filtered = incidents.filter((inc) => {
    const matchesCategory = filter === "all" || inc.type === filter;
    const matchesStatus =
      statusFilter === "all" ||
      (inc.verificationStatus || "unverified") === statusFilter;
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleValidate = (id: string) => {
    if (onValidateIncident) {
      onValidateIncident(id);
    } else if (onUpvoteIncident) {
      onUpvoteIncident(id);
    }
  };

  const handleRefute = (id: string) => {
    if (onRefuteIncident) {
      onRefuteIncident(id);
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportLocation.trim()) return;

    // Default coords close to Harare CBD with random jitter
    const jitterLat = (Math.random() - 0.5) * 0.04;
    const jitterLng = (Math.random() - 0.5) * 0.04;

    onReportIncident({
      type: reportType,
      title: reportTitle,
      location: reportLocation,
      coords: [-17.8292 + jitterLat, 31.0522 + jitterLng],
      severity: reportSeverity,
      description: reportDesc || "Reported live from Harare roads.",
      reporterRole: reportRole,
      alternateRoute: reportAlternate || "Take alternative suburban arterial roads.",
      hasVideo: reportHasVideo,
      videoUrl: reportHasVideo
        ? reportVideoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        : undefined,
    });

    // Reset & close
    setReportTitle("");
    setReportLocation("");
    setReportDesc("");
    setReportAlternate("");
    setReportHasVideo(false);
    setShowReportModal(false);
  };

  const getBadgeStyle = (type: IncidentType) => {
    switch (type) {
      case "accident":
        return { bg: "bg-red-500/20 text-red-400 border-red-500/40", icon: <Flame className="w-3.5 h-3.5" />, label: "Accident" };
      case "police":
        return { bg: "bg-blue-500/20 text-blue-400 border-blue-500/40", icon: <Shield className="w-3.5 h-3.5" />, label: "Police / VID" };
      case "robots_down":
        return { bg: "bg-amber-500/20 text-amber-400 border-amber-500/40", icon: <AlertTriangle className="w-3.5 h-3.5" />, label: "Robots Down" };
      case "hazard":
      case "flooding":
        return { bg: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40", icon: <AlertTriangle className="w-3.5 h-3.5" />, label: "Road Hazard" };
      case "pothole":
        return { bg: "bg-purple-500/20 text-purple-400 border-purple-500/40", icon: <HelpCircle className="w-3.5 h-3.5" />, label: "Pothole / Road Damage" };
      default:
        return { bg: "bg-orange-500/20 text-orange-400 border-orange-500/40", icon: <AlertTriangle className="w-3.5 h-3.5" />, label: "Traffic Congestion" };
    }
  };

  const getVerificationStatusBadge = (status?: VerificationStatus) => {
    switch (status) {
      case "verified":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Verified
          </span>
        );
      case "disputed":
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Disputed / Refuted
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xs">
            <Clock className="w-3 h-3 text-amber-400" />
            Unverified
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl">
      {/* Header with Report Button */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            Live Incident Radar
          </h3>
          <p className="text-xs text-slate-400">Crowdsourced traffic & police checkpoints in Harare</p>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Live Incident</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2 mb-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Seke Rd, Samora, 4th St..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950/70 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filter Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            {[
              { id: "all", label: "All Alerts" },
              { id: "police", label: "🛡️ Police & VID" },
              { id: "congestion", label: "🚗 Traffic & Jam" },
              { id: "accident", label: "💥 Accidents" },
              { id: "hazard", label: "⚠️ Road Hazards" },
              { id: "robots_down", label: "🚥 Robots Out" },
              { id: "pothole", label: "🕳️ Potholes" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition cursor-pointer ${
                  filter === item.id
                    ? "bg-amber-500 text-slate-950 font-bold shadow"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Verification Status Sub-filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[10px] text-slate-400">
            <span className="font-semibold text-slate-500 shrink-0">Status:</span>
            {[
              { id: "all", label: "All Statuses" },
              { id: "verified", label: "🟢 Verified Only" },
              { id: "unverified", label: "🟡 Unverified" },
              { id: "disputed", label: "🔴 Disputed" },
            ].map((statusItem) => (
              <button
                key={statusItem.id}
                onClick={() => setStatusFilter(statusItem.id)}
                className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
                  statusFilter === statusItem.id
                    ? "bg-slate-700 text-white font-bold border border-slate-600"
                    : "bg-slate-950/60 text-slate-400 hover:text-slate-200"
                }`}
              >
                {statusItem.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No incidents reported matching this criteria. Roads flowing smoothly!
          </div>
        ) : (
          filtered.map((inc) => {
            const badge = getBadgeStyle(inc.type);
            const isSelected = selectedIncident?.id === inc.id;

            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? "bg-slate-800/90 border-amber-500/80 shadow-md ring-1 ring-amber-500/40"
                    : "bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700"
                }`}
              >
                {/* Top Row: Type Badge + Verification Status + Timestamp */}
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badge.bg}`}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>
                    {getVerificationStatusBadge(inc.verificationStatus)}
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    {inc.timestamp}
                  </span>
                </div>

                {/* Title & Location */}
                <h4 className="text-sm font-semibold text-slate-100 mb-1 leading-snug">{inc.title}</h4>
                <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{inc.location}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 line-clamp-2 mb-2.5 leading-relaxed">{inc.description}</p>

                {/* Alternate Route recommendation banner */}
                {inc.alternateRoute && (
                  <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-2 mb-2 flex items-start justify-between gap-2 text-xs">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                        <Compass className="w-3 h-3" /> Recommended Alternate
                      </div>
                      <div className="text-slate-200 text-[11px] line-clamp-1">{inc.alternateRoute}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewAlternateRoute(inc);
                        }}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded flex items-center gap-1 transition cursor-pointer"
                      >
                        Bypass <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                      {onRequestControllerForIncident && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRequestControllerForIncident(inc);
                          }}
                          className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold rounded flex items-center gap-1 transition cursor-pointer"
                          title="Stuck in this bottleneck? Request a Traffic Controller to unblock it"
                        >
                          <ShieldAlert className="w-2.5 h-2.5 text-amber-400" />
                          <span>Get Controller</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions: Video clip + Reporter Info + Validate/Refute Mechanism */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    {inc.hasVideo && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenVideo(inc);
                        }}
                        className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 rounded text-[11px] font-medium transition cursor-pointer"
                      >
                        <Video className="w-3 h-3" />
                        <span>Watch Clip</span>
                      </button>
                    )}
                    <span className="text-[11px] text-slate-500">By {inc.reportedBy} ({inc.reporterRole})</span>
                  </div>

                  {/* Validate & Refute Mechanism */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleValidate(inc.id);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/50 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700/50 font-semibold text-xs transition cursor-pointer"
                      title="Validate: Confirm incident is active"
                    >
                      <ThumbsUp className="w-3 h-3 text-emerald-400" />
                      <span>Validate ({inc.upvotes})</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRefute(inc.id);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-800/60 text-rose-300 border border-rose-700/50 font-semibold text-xs transition cursor-pointer"
                      title="Refute: Report cleared or incorrect"
                    >
                      <ThumbsDown className="w-3 h-3 text-rose-400" />
                      <span>Refute ({inc.refutations || 0})</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Report Incident Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-5 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Report Harare Road Condition</h3>
                  <p className="text-xs text-slate-400">Crowdsource traffic, accidents, police stops, or road hazards</p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Incident Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "congestion", label: "🚗 Traffic & Jam", color: "border-orange-500" },
                    { id: "police", label: "🛡️ Police / VID", color: "border-blue-500" },
                    { id: "accident", label: "💥 Accident", color: "border-red-500" },
                    { id: "hazard", label: "⚠️ Road Hazard", color: "border-yellow-500" },
                    { id: "robots_down", label: "🚥 Robot Out", color: "border-amber-500" },
                    { id: "pothole", label: "🕳️ Pothole / Hole", color: "border-purple-500" },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setReportType(cat.id as IncidentType)}
                      className={`p-2 rounded-lg border text-center font-semibold transition cursor-pointer ${
                        reportType === cat.id
                          ? `bg-slate-800 ${cat.color} text-white shadow-sm ring-1`
                          : "border-slate-800 text-slate-400 hover:bg-slate-800/50"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Headline / Brief Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Heavy VIO Checkpoint slowing traffic towards Chitungwiza"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Specific Location / Road Junction</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Seke Road Flyover, just after Cripps Rd turn-off"
                  value={reportLocation}
                  onChange={(e) => setReportLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                {/* Quick suggestions */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500">Quick Picks:</span>
                  {POPULAR_LOCATIONS.slice(0, 4).map((loc) => (
                    <button
                      type="button"
                      key={loc.name}
                      onClick={() => setReportLocation(loc.name)}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded cursor-pointer"
                    >
                      {loc.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Severity / Impact</label>
                  <select
                    value={reportSeverity}
                    onChange={(e) => setReportSeverity(e.target.value as SeverityLevel)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="low">Low - Minor slow down</option>
                    <option value="medium">Medium - 10-15 min delay</option>
                    <option value="high">High - Severe 30+ min delay</option>
                    <option value="critical">Critical - Total blockage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Your Role</label>
                  <select
                    value={reportRole}
                    onChange={(e) => setReportRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Daily Commuter">Daily Commuter</option>
                    <option value="Kombi Driver">Kombi Driver</option>
                    <option value="Private Motorist">Private Motorist</option>
                    <option value="Rank Marshall">Rank Marshall</option>
                    <option value="Pedestrian">Pedestrian</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Suggested Alternate Route (How to Bypass)</label>
                <input
                  type="text"
                  placeholder="e.g., Take Dieppe Rd or Airport Rd to skip the Seke roadblock"
                  value={reportAlternate}
                  onChange={(e) => setReportAlternate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Details & Road Conditions</label>
                <textarea
                  rows={2}
                  placeholder="Explain what is happening (e.g., 3 police officers checking fitness disks, right lane closed, power cut to traffic lights)..."
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Video attach checkbox */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={reportHasVideo}
                    onChange={(e) => setReportHasVideo(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Attach eyewitness video clip or dashcam proof</span>
                </label>
                {reportHasVideo && (
                  <input
                    type="url"
                    placeholder="Video stream / MP4 URL (or leave blank to use simulated dashcam stream)"
                    value={reportVideoUrl}
                    onChange={(e) => setReportVideoUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 text-xs"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow cursor-pointer transition"
                >
                  Broadcast Alert Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
