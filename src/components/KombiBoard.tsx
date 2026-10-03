import React, { useState } from "react";
import {
  Bus,
  Briefcase,
  UserCheck,
  Phone,
  MapPin,
  Clock,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  Banknote,
  FileCheck2,
  Users,
  QrCode
} from "lucide-react";
import { KombiPost, RankStatus } from "../types";
import { KOMBI_RANKS } from "../data/harareData";

interface KombiBoardProps {
  posts: KombiPost[];
  onAddPost: (post: Partial<KombiPost>) => void;
  onOpenQrStation?: (stopName?: string) => void;
}

export const KombiBoard: React.FC<KombiBoardProps> = ({ posts, onAddPost, onOpenQrStation }) => {
  const [filterType, setFilterType] = useState<"all" | "owner_seeking_driver" | "driver_seeking_kombi">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [postType, setPostType] = useState<"owner_seeking_driver" | "driver_seeking_kombi">("owner_seeking_driver");
  const [title, setTitle] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("+263 ");
  const [vehicleDetails, setVehicleDetails] = useState("");
  const [route, setRoute] = useState("");
  const [remuneration, setRemuneration] = useState("");
  const [requirements, setRequirements] = useState("");
  const [location, setLocation] = useState("");

  const filteredPosts = posts.filter((p) => {
    const matchesType = filterType === "all" || p.type === filterType;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.operatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vehicleDetails.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contactPerson.trim() || !phone.trim()) return;

    onAddPost({
      type: postType,
      title,
      operatorName: operatorName || (postType === "owner_seeking_driver" ? "Kombi Operator" : "Licensed Driver"),
      contactPerson,
      phone,
      vehicleDetails: vehicleDetails || "Toyota Quantum / HiAce",
      route: route || "Harare Urban Arterials",
      remuneration: remuneration || "Negotiable daily target / commission",
      requirements: requirements || "Valid Class 2, Defensive Driving Certificate",
      location: location || "Harare CBD",
    });

    // Reset & close
    setTitle("");
    setOperatorName("");
    setContactPerson("");
    setPhone("+263 ");
    setVehicleDetails("");
    setRoute("");
    setRemuneration("");
    setRequirements("");
    setLocation("");
    setShowModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bus className="w-5 h-5 text-emerald-400" />
            Commuter Omnibus & Kombi Exchange
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              Harare Transit Board
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Kombi owners looking for drivers & qualified Class 2 drivers seeking commuter vehicles
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenQrStation && (
            <button
              onClick={() => onOpenQrStation()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              title="Print QR stickers for Kombi cars and Harare bus stops"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Print Car & Bus Stop QR</span>
            </button>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post Driver Notice / Kombi</span>
          </button>
        </div>
      </div>

      {/* Live Ranks Queue Status Ticker */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            CBD Rank Live Queue Monitor
          </span>
          <span className="text-slate-500 text-[11px]">Updated 5 mins ago</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {KOMBI_RANKS.map((rank) => (
            <div
              key={rank.id}
              className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1.5 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs truncate">{rank.name}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    rank.queueStatus.includes("Packed")
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {rank.queueStatus}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Wait: <strong className="text-slate-200">{rank.averageWaitTime}</strong></span>
                <span>Kombis: <strong className="text-slate-200">{rank.activeKombis}</strong></span>
              </div>
              <div className="text-[11px] text-emerald-400 font-bold pt-1 border-t border-slate-800/60 flex items-center justify-between">
                <span>Fare: ${rank.currentFareUSD} USD</span>
                <span className="text-slate-400 text-[10px]">{rank.currentFareZiG} ZiG</span>
              </div>
              {onOpenQrStation && (
                <button
                  type="button"
                  onClick={() => onOpenQrStation(rank.name)}
                  className="w-full mt-1.5 py-1 px-2 bg-slate-900 hover:bg-slate-800 text-amber-400 text-[10px] font-bold rounded-lg border border-slate-800 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <QrCode className="w-3 h-3" />
                  <span>Print Stop Sign QR</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filter Chips & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === "all"
                ? "bg-emerald-500 text-slate-950 font-bold shadow"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            All Notices ({posts.length})
          </button>
          <button
            onClick={() => setFilterType("owner_seeking_driver")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterType === "owner_seeking_driver"
                ? "bg-emerald-500 text-slate-950 font-bold shadow"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>Kombi Owners Seeking Drivers</span>
          </button>
          <button
            onClick={() => setFilterType("driver_seeking_kombi")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filterType === "driver_seeking_kombi"
                ? "bg-emerald-500 text-slate-950 font-bold shadow"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Drivers Seeking Kombis</span>
          </button>
        </div>

        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by route, Quantum, HiAce, Chitungwiza..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No kombi operator listings matching this filter.
          </div>
        ) : (
          filteredPosts.map((p) => {
            const isOwner = p.type === "owner_seeking_driver";

            return (
              <div
                key={p.id}
                className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 transition shadow-sm space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isOwner
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }`}
                      >
                        {isOwner ? "🚐 Omnibus Looking for Driver" : "👨‍✈️ Driver Looking for Omnibus"}
                      </span>
                      <span className="text-[11px] text-slate-500">{p.postedDate}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{p.title}</h4>
                    <p className="text-xs text-slate-400">
                      {p.operatorName} • <span className="text-slate-300">{p.location}</span>
                    </p>
                  </div>

                  <a
                    href={`tel:${p.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call / WhatsApp</span>
                  </a>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Assigned Route</span>
                    <span className="font-semibold text-slate-200">{p.route}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Vehicle Model</span>
                    <span className="font-semibold text-slate-200">{p.vehicleDetails}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Target / Remuneration</span>
                    <span className="font-bold text-emerald-400">{p.remuneration}</span>
                  </div>
                </div>

                {/* Requirements */}
                <div className="flex items-start gap-2 text-xs text-slate-300">
                  <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">Requirements / Qualifications: </strong>
                    {p.requirements}
                  </div>
                </div>

                {/* Footer contact person */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                  <span>Contact person: <strong className="text-slate-300">{p.contactPerson}</strong> ({p.phone})</span>
                  <span className="text-emerald-400">Verified Harare Transit Member</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-5 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Bus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Post Commuter Omnibus Notice</h3>
                  <p className="text-xs text-slate-400">Connect with drivers or kombi operators in Harare</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPostType("owner_seeking_driver")}
                  className={`flex-1 py-1.5 rounded text-xs font-bold transition cursor-pointer ${
                    postType === "owner_seeking_driver"
                      ? "bg-emerald-500 text-slate-950 shadow"
                      : "text-slate-400"
                  }`}
                >
                  I am a Kombi Owner Seeking Driver
                </button>
                <button
                  type="button"
                  onClick={() => setPostType("driver_seeking_kombi")}
                  className={`flex-1 py-1.5 rounded text-xs font-bold transition cursor-pointer ${
                    postType === "driver_seeking_kombi"
                      ? "bg-blue-500 text-white shadow"
                      : "text-slate-400"
                  }`}
                >
                  I am a Driver Seeking Kombi
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Headline</label>
                <input
                  type="text"
                  required
                  placeholder={
                    postType === "owner_seeking_driver"
                      ? "e.g., Looking for Experienced Class 2 Driver for Chitungwiza Quantum"
                      : "e.g., Class 2 Driver with 6 Yrs Experience Seeking HiAce on Kuwadzana Route"
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Company / Operator / Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Zuva Urban Trans or Driver Farai"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Person & Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+263 77 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Vehicle Details</label>
                  <input
                    type="text"
                    placeholder="e.g., Toyota Quantum 2018 (16 Seater)"
                    value={vehicleDetails}
                    onChange={(e) => setVehicleDetails(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Route Corridor</label>
                  <input
                    type="text"
                    placeholder="e.g., Chitungwiza (Zengeza) <-> Charge Office"
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Remuneration / Daily Target</label>
                  <input
                    type="text"
                    placeholder="e.g., $40/day target or 35% commission"
                    value={remuneration}
                    onChange={(e) => setRemuneration(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Base Suburb / Rank Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Harare CBD / Copacabana"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Requirements & Experience</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Valid Defensive Driving Cert, minimum 3 years urban kombi experience, traceable references."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shadow cursor-pointer transition"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
