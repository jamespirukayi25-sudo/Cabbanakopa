import React, { useState, useMemo } from "react";
import {
  Users,
  MessageSquare,
  Radio,
  Megaphone,
  AlertTriangle,
  ShieldAlert,
  Fuel,
  HelpCircle,
  Briefcase,
  ThumbsUp,
  CheckCircle,
  Clock,
  MapPin,
  Send,
  Plus,
  Search,
  Filter,
  Volume2,
  VolumeX,
  Sparkles,
  Loader2,
  RefreshCw,
  X,
  ChevronDown,
  Check,
  ArrowRight,
  Bell,
  Bus,
  Car,
  BadgeAlert,
  Phone,
  Layers,
  ShoppingBag,
  Tag,
  QrCode
} from "lucide-react";
import {
  DriverCommunityPost,
  DriverCommunityReply,
  DriverInfoCategory,
  UserCommunityRole,
  MarketplaceItem,
  MarketplaceStatus
} from "../types";
import { CommunityMarketplace } from "./CommunityMarketplace";

interface DriverCommunityHubProps {
  posts: DriverCommunityPost[];
  marketplaceItems?: MarketplaceItem[];
  initialCommunitySubTab?: "intel" | "marketplace";
  onAddPost: (newPost: Partial<DriverCommunityPost>) => Promise<void> | void;
  onAcknowledgePost: (id: string, driverName?: string, note?: string) => Promise<void> | void;
  onVotePost: (id: string, delta: number) => Promise<void> | void;
  onReplyPost: (postId: string, reply: { author: string; role: UserCommunityRole; text: string; badge?: string }) => Promise<void> | void;
  onViewOnMap?: (coords: [number, number]) => void;
  onAddMarketplaceItem?: (newItem: Partial<MarketplaceItem>) => Promise<any>;
  onLikeMarketplaceItem?: (id: string) => Promise<void> | void;
  onUpdateMarketplaceStatus?: (id: string, status: MarketplaceStatus) => Promise<void> | void;
  onOpenQrStation?: () => void;
}

const CORRIDORS = [
  "All Corridors",
  "Seke Road Corridor",
  "Bulawayo Road Corridor",
  "Samora Machel / Mutare Rd",
  "Lomagundi / Westgate Corridor",
  "CBD Core & Ranks",
  "Borrowdale / North Corridor",
  "High Glen / Glen View Corridor",
  "Airport Road Bypass"
];

const CATEGORY_META: Record<
  DriverInfoCategory,
  { label: string; icon: React.ElementType; color: string; bg: string; border: string; desc: string }
> = {
  passenger_demand: {
    label: "Pick Us Up / Crowd Waiting",
    icon: Megaphone,
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    desc: "Commuters stranded or packed ranks needing drivers"
  },
  road_checkpoint: {
    label: "Police & VID Checkpoints",
    icon: ShieldAlert,
    color: "text-rose-400",
    bg: "bg-rose-500/15",
    border: "border-rose-500/30",
    desc: "Active vehicle inspection, permits, and roadblock alerts"
  },
  traffic_detour: {
    label: "Detours & Hazards",
    icon: AlertTriangle,
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    border: "border-orange-500/30",
    desc: "Potholes, gridlocks, broken-down trucks, robots flashing"
  },
  fuel_services: {
    label: "Fuel & Driver Services",
    icon: Fuel,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    desc: "Short diesel/petrol queues, tyre repairs, spare parts"
  },
  commuter_inquiry: {
    label: "Commuter Question to Drivers",
    icon: HelpCircle,
    color: "text-cyan-400",
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/30",
    desc: "Timetable, late night routes, luggage queries"
  },
  lost_and_found: {
    label: "Lost & Found in Transit",
    icon: Briefcase,
    color: "text-purple-400",
    bg: "bg-purple-500/15",
    border: "border-purple-500/30",
    desc: "Property left in kombis, taxis, or passenger vehicles"
  },
  general_tip: {
    label: "Driver & Commuter Tip",
    icon: Users,
    color: "text-slate-300",
    bg: "bg-slate-800",
    border: "border-slate-700",
    desc: "General Harare road tips and mutual advisories"
  }
};

const ROLE_LABELS: Record<UserCommunityRole, { name: string; badgeColor: string; icon: React.ElementType }> = {
  commuter: { name: "Commuter / Passenger", badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", icon: Users },
  kombi_driver: { name: "Kombi Driver (Class 2)", badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30", icon: Bus },
  carpool_driver: { name: "Carpool / Mushikashika Driver", badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: Car },
  rank_marshall: { name: "Rank Marshall / Supervisor", badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30", icon: BadgeAlert },
  motorist: { name: "Private Motorist", badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: Car },
  resident: { name: "Roadside Resident / Vendor", badgeColor: "bg-slate-700 text-slate-300 border-slate-600", icon: Users }
};

export const DriverCommunityHub: React.FC<DriverCommunityHubProps> = ({
  posts,
  marketplaceItems = [],
  initialCommunitySubTab = "intel",
  onAddPost,
  onAcknowledgePost,
  onVotePost,
  onReplyPost,
  onViewOnMap,
  onAddMarketplaceItem,
  onLikeMarketplaceItem,
  onUpdateMarketplaceStatus,
  onOpenQrStation
}) => {
  // Subtab State: "intel" (Road Tips & Hotspots) vs "marketplace" (Cars, Gadgets, Goods for Sale)
  const [activeSubTab, setActiveSubTab] = useState<"intel" | "marketplace">(initialCommunitySubTab);

  // Search and Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCorridor, setSelectedCorridor] = useState<string>("All Corridors");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"urgent" | "votes" | "recent">("urgent");

  // Expanded post for discussion
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [postId: string]: string }>({});
  const [replyRole, setReplyRole] = useState<UserCommunityRole>("commuter");
  const [replyAuthorName, setReplyAuthorName] = useState("");

  // Quick Driver Acknowledge modal/state
  const [driverAcknowledgeModalPost, setDriverAcknowledgeModalPost] = useState<DriverCommunityPost | null>(null);
  const [driverNameInput, setDriverNameInput] = useState("Captain Farai");
  const [driverEtaNote, setDriverEtaNote] = useState("Heading through in 10 mins with 6 open seats");

  // Create Post Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<DriverInfoCategory>("passenger_demand");
  const [newCorridor, setNewCorridor] = useState("Seke Road Corridor");
  const [newLocation, setNewLocation] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newAuthorRole, setNewAuthorRole] = useState<UserCommunityRole>("commuter");
  const [newPhone, setNewPhone] = useState("");
  const [newUrgency, setNewUrgency] = useState<"urgent" | "moderate" | "info">("urgent");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Driver Radio Dispatch Voice Bulletin State
  const [showRadioModal, setShowRadioModal] = useState(false);
  const [radioLoading, setRadioLoading] = useState(false);
  const [radioBulletin, setRadioBulletin] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Filtered & Sorted Posts
  const filteredPosts = useMemo(() => {
    let list = [...posts];

    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (selectedCorridor !== "All Corridors") {
      list = list.filter((p) => p.corridor === selectedCorridor);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.corridor.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortBy === "urgent") {
      list.sort((a, b) => {
        const score = (p: DriverCommunityPost) => (p.urgency === "urgent" ? 3 : p.urgency === "moderate" ? 2 : 1);
        return score(b) - score(a);
      });
    } else if (sortBy === "votes") {
      list.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    }

    return list;
  }, [posts, selectedCategory, selectedCorridor, searchQuery, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = posts.length;
    const passengerDemand = posts.filter((p) => p.category === "passenger_demand").length;
    const checkpoints = posts.filter((p) => p.category === "road_checkpoint").length;
    const totalDriverAcks = posts.reduce((sum, p) => sum + (p.driverAcknowledgments || 0), 0);
    return { total, passengerDemand, checkpoints, totalDriverAcks };
  }, [posts]);

  // Handle Radio Dispatch generation
  const handleGenerateRadioDispatch = async () => {
    setShowRadioModal(true);
    setRadioLoading(true);
    try {
      const res = await fetch("/api/ai/driver-dispatch-bulletin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ corridor: selectedCorridor !== "All Corridors" ? selectedCorridor : undefined })
      });
      const data = await res.json();
      setRadioBulletin(data.bulletin);
    } catch (err) {
      console.error(err);
      setRadioBulletin("Harare Driver Dispatch: Heavy queues at Simon Muzenda rank for Chitungwiza. Checkpoint active at Seke Road Flyover outer lane. Drive safe!");
    } finally {
      setRadioLoading(false);
    }
  };

  // Text-to-Speech playback for Drivers on the road
  const toggleSpeech = () => {
    if (!window.speechSynthesis || !radioBulletin) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean text for speech
    const cleanText = radioBulletin.replace(/[#*_📻•]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Submit new community post
  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddPost({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        corridor: newCorridor,
        location: newLocation.trim() || "Harare Metro",
        author: newAuthor.trim() || "Harare Citizen",
        authorRole: newAuthorRole,
        authorPhone: newPhone.trim() || undefined,
        urgency: newUrgency,
        tags: [
          CATEGORY_META[newCategory].label.split("/")[0].trim(),
          newCorridor.split(" ")[0],
          newUrgency === "urgent" ? "Urgent Tip" : "Community Update"
        ]
      });

      // Reset form
      setNewTitle("");
      setNewContent("");
      setNewLocation("");
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick preset template filler
  const handleApplyPreset = (category: DriverInfoCategory, sampleTitle: string, sampleContent: string) => {
    setNewCategory(category);
    setNewTitle(sampleTitle);
    setNewContent(sampleContent);
    setNewUrgency(category === "passenger_demand" || category === "road_checkpoint" ? "urgent" : "moderate");
  };

  // Submit reply
  const handleSubmitReply = async (postId: string) => {
    const text = replyText[postId];
    if (!text || !text.trim()) return;

    const author = replyAuthorName.trim() || (replyRole.includes("driver") ? "Harare Driver" : "Commuter");
    const badge = replyRole === "kombi_driver" ? "Kombi Captain" : replyRole === "carpool_driver" ? "Carpool Driver" : undefined;

    await onReplyPost(postId, {
      author,
      role: replyRole,
      text: text.trim(),
      badge
    });

    setReplyText((prev) => ({ ...prev, [postId]: "" }));
  };

  // Confirm Driver Acknowledgment
  const handleConfirmDriverAck = async () => {
    if (!driverAcknowledgeModalPost) return;
    await onAcknowledgePost(
      driverAcknowledgeModalPost.id,
      driverNameInput || "Active Driver",
      driverEtaNote || undefined
    );
    setDriverAcknowledgeModalPost(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Community Section Dual Tabs: Road Intelligence VS Marketplace */}
      <div className="flex items-center justify-between p-2.5 bg-slate-950/95 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("intel")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === "intel"
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${activeSubTab === "intel" ? "text-slate-950" : "text-amber-400"}`} />
            <span>Driver Intelligence & Road Reports</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSubTab === "intel" ? "bg-slate-950 text-amber-400" : "bg-slate-800 text-slate-400"
              }`}
            >
              {posts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("marketplace")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === "marketplace"
                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <ShoppingBag className={`w-3.5 h-3.5 ${activeSubTab === "marketplace" ? "text-slate-950" : "text-emerald-400"}`} />
            <span>Harare Community Marketplace</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSubTab === "marketplace"
                  ? "bg-slate-950 text-amber-400"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {marketplaceItems.length} goods
            </span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400">
          <Tag className="w-3 h-3 text-amber-400" />
          <span>Cars, Gadgets, Electronics & Spares</span>
        </div>
      </div>

      {activeSubTab === "marketplace" ? (
        <div className="flex-1 overflow-hidden">
          <CommunityMarketplace
            items={marketplaceItems}
            onAddItem={onAddMarketplaceItem || (async () => {})}
            onLikeItem={onLikeMarketplaceItem}
            onUpdateStatus={onUpdateMarketplaceStatus}
          />
        </div>
      ) : (
        <>
          {/* Top Banner / Community Identity */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                Driver & Commuter Community Intelligence
              </h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
                Direct Two-Way Exchange
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl">
              Where passengers, rank marshalls, and motorists share live tips with drivers — including stranded crowd hotspots, police/VID inspections, road hazards, fuel availability, and lost property.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenQrStation && (
              <button
                onClick={onOpenQrStation}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-amber-500/30 text-amber-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Print In-Car Windscreen & Seatback QR Code stickers"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Car & Stop QR</span>
              </button>
            )}

            <button
              onClick={handleGenerateRadioDispatch}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Generate 30-second driver radio voice bulletin"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Driver Radio Dispatch</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Share Info With Drivers</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400">Active Reports</div>
              <div className="text-sm font-black text-white">{stats.total}</div>
            </div>
            <Megaphone className="w-4 h-4 text-slate-500" />
          </div>

          <div className="bg-slate-950/70 border border-amber-900/40 rounded-xl p-2 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-amber-300">Crowd Hotspots</div>
              <div className="text-sm font-black text-amber-400">{stats.passengerDemand}</div>
            </div>
            <Users className="w-4 h-4 text-amber-400" />
          </div>

          <div className="bg-slate-950/70 border border-rose-900/40 rounded-xl p-2 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-rose-300">Police/VID Checks</div>
              <div className="text-sm font-black text-rose-400">{stats.checkpoints}</div>
            </div>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>

          <div className="bg-slate-950/70 border border-emerald-900/40 rounded-xl p-2 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-emerald-300">Driver Acks</div>
              <div className="text-sm font-black text-emerald-400">{stats.totalDriverAcks}</div>
            </div>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 space-y-2.5 shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by rank, roadblock, pothole, or route..."
              className="w-full pl-8.5 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Corridor Select */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={selectedCorridor}
              onChange={(e) => setSelectedCorridor(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {CORRIDORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="urgent">Sort: Urgent First</option>
              <option value="votes">Sort: Most Helpful</option>
              <option value="recent">Sort: Newest</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
              selectedCategory === "all"
                ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            All Reports ({posts.length})
          </button>

          {(Object.keys(CATEGORY_META) as DriverInfoCategory[]).map((catKey) => {
            const meta = CATEGORY_META[catKey];
            const Icon = meta.icon;
            const count = posts.filter((p) => p.category === catKey).length;
            const isActive = selectedCategory === catKey;

            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 border ${
                  isActive
                    ? `${meta.bg} ${meta.color} ${meta.border} font-bold shadow-sm`
                    : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? meta.color : "text-slate-400"}`} />
                <span>{meta.label.split("/")[0]}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? "bg-slate-950/60" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Feed of Community Reports */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-200">No reports match your filter</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Be the first to share an alert with drivers on this corridor or clear your filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedCorridor("All Corridors");
                setSearchQuery("");
              }}
              className="px-3 py-1.5 bg-slate-800 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 hover:bg-slate-700 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const catMeta = CATEGORY_META[post.category] || CATEGORY_META.general_tip;
            const CatIcon = catMeta.icon;
            const roleMeta = ROLE_LABELS[post.authorRole] || ROLE_LABELS.commuter;
            const isExpanded = expandedPostId === post.id;
            const repliesCount = post.replies?.length || 0;

            return (
              <div
                key={post.id}
                id={`post-${post.id}`}
                className={`bg-slate-950/80 border rounded-2xl p-4 transition-all shadow-md ${
                  post.urgency === "urgent"
                    ? "border-amber-500/40 hover:border-amber-500/60"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Header: Category Badge + Urgency + Corridor + Time */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${catMeta.bg} ${catMeta.color} ${catMeta.border}`}
                    >
                      <CatIcon className="w-3.5 h-3.5" />
                      <span>{catMeta.label}</span>
                    </span>

                    {post.urgency === "urgent" && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 font-extrabold px-2 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        URGENT
                      </span>
                    )}

                    <span className="text-[11px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{post.corridor}</span>
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.timestamp}
                  </span>
                </div>

                {/* Title & Content */}
                <div className="space-y-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>
                </div>

                {/* Location & Tags */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-2.5 pb-2 text-xs border-b border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="font-semibold text-slate-300">Location:</span>
                    <span className="text-amber-300 font-medium">{post.location}</span>
                    {post.coords && onViewOnMap && (
                      <button
                        onClick={() => onViewOnMap(post.coords!)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-semibold ml-1 cursor-pointer flex items-center gap-0.5"
                      >
                        View on Map
                      </button>
                    )}
                  </div>

                  {/* Reporter info */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400">Reported by:</span>
                    <span className="text-slate-200 font-bold">{post.author}</span>
                    <span className={`text-[10px] px-2 py-0.2 rounded-full border ${roleMeta.badgeColor}`}>
                      {roleMeta.name}
                    </span>
                    {post.authorPhone && (
                      <a
                        href={`tel:${post.authorPhone}`}
                        className="text-amber-400 hover:underline flex items-center gap-0.5 ml-1 font-mono text-[10px]"
                      >
                        <Phone className="w-2.5 h-2.5" />
                        {post.authorPhone}
                      </a>
                    )}
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
                  {/* Left: Driver Status & Acknowledgment */}
                  <div className="flex items-center gap-2">
                    {post.driverConfirmed ? (
                      <div className="flex items-center gap-1.5 text-[11px] bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 px-2.5 py-1 rounded-xl">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          <strong>{post.driverAcknowledgments}</strong> Driver{post.driverAcknowledgments !== 1 ? "s" : ""} Acknowledged
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">
                        Waiting for driver acknowledgment
                      </span>
                    )}

                    {/* Driver "Acknowledge / On My Way" CTA */}
                    <button
                      onClick={() => setDriverAcknowledgeModalPost(post)}
                      className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                      title="Confirm this alert or state your ETA as a driver"
                    >
                      <Bus className="w-3.5 h-3.5" />
                      <span>Driver: On My Way 🚐</span>
                    </button>
                  </div>

                  {/* Right: Helpful Upvote & Discussion toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onVotePost(post.id, 1)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                      title="Mark as helpful to drivers"
                    >
                      <ThumbsUp className="w-3 h-3 text-amber-400" />
                      <span>Helpful ({post.upvotes || 0})</span>
                    </button>

                    <button
                      onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isExpanded
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80"
                      }`}
                    >
                      <MessageSquare className="w-3 h-3 text-cyan-400" />
                      <span>
                        {repliesCount > 0 ? `${repliesCount} Direct Replies` : "Reply / Chat"}
                      </span>
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Expanded Two-Way Discussion & Replies Thread */}
                {isExpanded && (
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-3 bg-slate-900/40 -mx-4 -mb-4 p-4 rounded-b-2xl">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                        Driver & Commuter Live Chat ({repliesCount})
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Direct communication channel
                      </span>
                    </div>

                    {/* Replies list */}
                    {repliesCount === 0 ? (
                      <div className="text-xs text-slate-500 italic py-2">
                        No responses yet. Drivers can reply with their ETA, seats available, or confirm road status.
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {post.replies.map((reply) => {
                          const rRole = ROLE_LABELS[reply.role] || ROLE_LABELS.commuter;
                          return (
                            <div
                              key={reply.id}
                              className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                                reply.isDriver
                                  ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-100"
                                  : "bg-slate-900 border-slate-800 text-slate-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-white">
                                    {reply.author}
                                  </span>
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full border ${rRole.badgeColor}`}>
                                    {reply.badge || rRole.name}
                                  </span>
                                  {reply.isDriver && (
                                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                                      DRIVER
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500">
                                  {reply.timestamp}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 leading-snug">
                                {reply.text}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Reply Input Box */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-slate-400 text-[11px]">Your Role:</span>
                        <select
                          value={replyRole}
                          onChange={(e: any) => setReplyRole(e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                        >
                          <option value="commuter">Commuter / Passenger</option>
                          <option value="kombi_driver">Kombi Driver (Class 2)</option>
                          <option value="carpool_driver">Carpool / Mushikashika Driver</option>
                          <option value="rank_marshall">Rank Marshall</option>
                          <option value="motorist">Private Motorist</option>
                        </select>

                        <input
                          type="text"
                          value={replyAuthorName}
                          onChange={(e) => setReplyAuthorName(e.target.value)}
                          placeholder="Your Name (e.g. Captain Farai, Chipo M.)"
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-slate-500 flex-1 min-w-[140px] focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={replyText[post.id] || ""}
                          onChange={(e) =>
                            setReplyText((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmitReply(post.id);
                            }
                          }}
                          placeholder={
                            replyRole.includes("driver")
                              ? "Driver reply: 'Arriving in 10 mins with 4 seats open' or 'Avoid this turn'..."
                              : "Reply to driver or share more details on this spot..."
                          }
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          onClick={() => handleSubmitReply(post.id)}
                          className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: SHARE INFORMATION WITH DRIVERS                      */}
      {/* ============================================================ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Share Information With Drivers
                  </h3>
                  <p className="text-xs text-slate-400">
                    Broadcast road intelligence, passenger demand, or roadblock warnings
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1-Click Quick Preset Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Preset Templates:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleApplyPreset(
                      "passenger_demand",
                      "Over 30 Commuters Waiting (Need Pick Up)",
                      "Large group of passengers stranded with cash ready. Rain threatening. Empty kombis or carpools please divert here immediately!"
                    )
                  }
                  className="p-2 bg-slate-950 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left transition cursor-pointer text-xs space-y-0.5"
                >
                  <div className="font-bold text-amber-400 flex items-center gap-1">
                    <Megaphone className="w-3 h-3" /> Stranded Crowd
                  </div>
                  <div className="text-[10px] text-slate-400">Pick us up alert</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleApplyPreset(
                      "road_checkpoint",
                      "Police & VID Inspection Roadblock",
                      "Active vehicle fitness inspection on outer lane. Slow moving queues. Commuters and drivers be prepared with docs."
                    )
                  }
                  className="p-2 bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 rounded-xl text-left transition cursor-pointer text-xs space-y-0.5"
                >
                  <div className="font-bold text-rose-400 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Roadblock Alert
                  </div>
                  <div className="text-[10px] text-slate-400">VID / ZRP check</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleApplyPreset(
                      "traffic_detour",
                      "Hazardous Pothole / Traffic Gridlock",
                      "Deep flooded pothole or disabled vehicle blocking lane. Slow crawl. Drivers recommended to use inner lane or alternate route."
                    )
                  }
                  className="p-2 bg-slate-950 hover:bg-orange-950/40 border border-slate-800 hover:border-orange-500/40 rounded-xl text-left transition cursor-pointer text-xs space-y-0.5"
                >
                  <div className="font-bold text-orange-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Hazard / Detour
                  </div>
                  <div className="text-[10px] text-slate-400">Obstruction info</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleApplyPreset(
                      "fuel_services",
                      "Diesel Available (Zero Queue)",
                      "Fresh low-sulphur diesel fuel delivered. No long queues. Swipes and USD cash accepted at standard price."
                    )
                  }
                  className="p-2 bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left transition cursor-pointer text-xs space-y-0.5"
                >
                  <div className="font-bold text-emerald-400 flex items-center gap-1">
                    <Fuel className="w-3 h-3" /> Fuel Station Tip
                  </div>
                  <div className="text-[10px] text-slate-400">Short queue alert</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleApplyPreset(
                      "commuter_inquiry",
                      "Commuter Route & Timetable Inquiry",
                      "Looking for confirmation from drivers: What time do last kombis leave this evening? Are private carpoolers operating?"
                    )
                  }
                  className="p-2 bg-slate-950 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-left transition cursor-pointer text-xs space-y-0.5"
                >
                  <div className="font-bold text-cyan-400 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" /> Ask Drivers
                  </div>
                  <div className="text-[10px] text-slate-400">Route question</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleApplyPreset(
                      "lost_and_found",
                      "Lost Property Left in Vehicle",
                      "Passenger left a bag/wallet in kombi during commute. Route details and description attached. Reward offered."
                    )
                  }
                  className="p-2 bg-slate-950 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 rounded-xl text-left transition cursor-pointer text-xs space-y-0.5"
                >
                  <div className="font-bold text-purple-400 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Lost in Transit
                  </div>
                  <div className="text-[10px] text-slate-400">Driver assistance</div>
                </button>
              </div>
            </div>

            {/* The Form */}
            <form onSubmit={handleCreatePostSubmit} className="space-y-3.5 pt-2">
              {/* Category & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Information Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="passenger_demand">📢 Pick Us Up / Crowd Waiting</option>
                    <option value="road_checkpoint">🚨 Police & VID Roadblock</option>
                    <option value="traffic_detour">🚧 Detour, Pothole, or Hazard</option>
                    <option value="fuel_services">⛽ Fuel & Driver Service</option>
                    <option value="commuter_inquiry">❓ Question to Drivers</option>
                    <option value="lost_and_found">💼 Lost & Found Property</option>
                    <option value="general_tip">💡 General Traffic Tip</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Urgency Level</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "urgent", label: "Urgent!", color: "border-rose-500 text-rose-300 bg-rose-950/30" },
                      { id: "moderate", label: "Moderate", color: "border-amber-500 text-amber-300 bg-amber-950/30" },
                      { id: "info", label: "Info Only", color: "border-slate-600 text-slate-300 bg-slate-900" }
                    ].map((u) => (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => setNewUrgency(u.id as any)}
                        className={`py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                          newUrgency === u.id ? `${u.color} ring-1 ring-amber-400` : "border-slate-800 text-slate-500 bg-slate-950"
                        }`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Headline / Short Summary <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 50 people stuck at Westgate Roundabout heading CBD"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Corridor and Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Corridor / Axis</label>
                  <select
                    value={newCorridor}
                    onChange={(e) => setNewCorridor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    {CORRIDORS.filter((c) => c !== "All Corridors").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Exact Location / Landmark</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Westgate Roundabout opposite Puma"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Details Content */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Detailed Information for Drivers <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Provide details: estimated crowd size, lanes affected, fare ready, VID direction, or special instructions..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Reporter Info: Name, Role, Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Your Name</label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Tadiwa M."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Your Role</label>
                  <select
                    value={newAuthorRole}
                    onChange={(e: any) => setNewAuthorRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="commuter">Commuter / Passenger</option>
                    <option value="kombi_driver">Kombi Driver</option>
                    <option value="carpool_driver">Carpool Driver</option>
                    <option value="rank_marshall">Rank Marshall</option>
                    <option value="motorist">Motorist</option>
                    <option value="resident">Local Resident</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Phone (Optional)</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+263 77 ..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Megaphone className="w-4 h-4" />
                      <span>Broadcast to Drivers</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: DRIVER "ON MY WAY / ACKNOWLEDGE" MODAL               */}
      {/* ============================================================ */}
      {driverAcknowledgeModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl w-full max-w-md shadow-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Bus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Driver Acknowledgment
                  </h3>
                  <p className="text-xs text-slate-400">
                    Confirm you are heading to or have noted this report
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDriverAcknowledgeModalPost(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                Target Alert:
              </span>
              <div className="text-xs font-bold text-white">
                {driverAcknowledgeModalPost.title}
              </div>
              <div className="text-[11px] text-amber-300">
                Location: {driverAcknowledgeModalPost.location}
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Your Driver Handle / Name</label>
                <input
                  type="text"
                  value={driverNameInput}
                  onChange={(e) => setDriverNameInput(e.target.value)}
                  placeholder="e.g. Captain Farai (Kombi #41)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">ETA / Message to Commuters</label>
                <input
                  type="text"
                  value={driverEtaNote}
                  onChange={(e) => setDriverEtaNote(e.target.value)}
                  placeholder="e.g. Passing by in 8 minutes with 7 open seats!"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDriverAcknowledgeModalPost(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDriverAck}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Notify Commuters</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: AI DRIVER RADIO DISPATCH VOICE BULLETIN             */}
      {/* ============================================================ */}
      {showRadioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-lg shadow-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Harare Driver Radio Dispatch
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.2 rounded-full font-bold">
                      ON AIR
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Hands-free audio summary of active road conditions & crowd pickups
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                  setShowRadioModal(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Radio Player Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              {radioLoading ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-2 text-amber-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs text-slate-400">
                    Compiling live traffic & passenger intelligence dispatch...
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                      ● Live Dispatch Audio Feed
                    </span>
                    <button
                      onClick={toggleSpeech}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                        isSpeaking
                          ? "bg-rose-500 text-white animate-pulse"
                          : "bg-amber-500 text-slate-950 hover:bg-amber-400"
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Pause Audio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Play Audio Dispatch</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Transcript */}
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-200 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-line font-sans">
                    {radioBulletin}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Selected Corridor: <strong>{selectedCorridor}</strong></span>
              <button
                onClick={handleGenerateRadioDispatch}
                disabled={radioLoading}
                className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Refresh Bulletin
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
