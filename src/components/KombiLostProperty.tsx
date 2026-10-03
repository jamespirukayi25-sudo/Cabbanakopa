import React, { useState } from "react";
import {
  PackageSearch,
  Search,
  Plus,
  Phone,
  Calendar,
  MapPin,
  CheckCircle2,
  Tag,
  AlertCircle,
  Bus,
  ShieldCheck
} from "lucide-react";

export interface LostItem {
  id: string;
  itemType: "national_id" | "phone" | "bag" | "wallet" | "keys" | "other";
  title: string;
  description: string;
  kombiRoute: string;
  kombiReg?: string;
  dateLost: string;
  contactPerson: string;
  phone: string;
  status: "lost" | "recovered";
  isDriverReport: boolean; // True if driver found it and reported it
}

export const KombiLostProperty: React.FC = () => {
  const [items, setItems] = useState<LostItem[]>([
    {
      id: "item-1",
      itemType: "phone",
      title: "Samsung Galaxy A24 (Blue Cover)",
      description: "Left on back seat of White Quantum heading to Kuwadzana 2 from Copacabana around 18:30.",
      kombiRoute: "Copacabana to Kuwadzana",
      kombiReg: "AFX 7812",
      dateLost: "Yesterday 18:30",
      contactPerson: "Tinashe Moyo",
      phone: "+263 77 412 8890",
      status: "lost",
      isDriverReport: false
    },
    {
      id: "item-2",
      itemType: "national_id",
      title: "National ID Card & Driver's License",
      description: "Found tucked beside front passenger seat. Name on ID: Ruvimbo M. Handed to Rank Marshall at 4th Street rank office.",
      kombiRoute: "4th Street to Chitungwiza Makoni",
      kombiReg: "AGE 4109",
      dateLost: "Today 08:15",
      contactPerson: "Conductor Baba Brian",
      phone: "+263 71 298 3341",
      status: "recovered",
      isDriverReport: true
    },
    {
      id: "item-3",
      itemType: "bag",
      title: "Black Laptop Backpack (Dell Charger inside)",
      description: "Left under middle row seat in Highfield kombi arriving at Market Square around 07:45.",
      kombiRoute: "Highfield (Machipisa) to Market Square",
      kombiReg: "AEL 9231",
      dateLost: "Today 07:45",
      contactPerson: "Farai Chitepo",
      phone: "+263 78 554 9901",
      status: "lost",
      isDriverReport: false
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [isDriverFound, setIsDriverFound] = useState(false);
  const [title, setTitle] = useState("");
  const [itemType, setItemType] = useState<LostItem["itemType"]>("bag");
  const [description, setDescription] = useState("");
  const [kombiRoute, setKombiRoute] = useState("Copacabana to Kuwadzana");
  const [kombiReg, setKombiReg] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("+263 ");

  const filteredItems = items.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.kombiRoute.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.kombiReg && i.kombiReg.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === "all" || i.itemType === filterType;
    return matchesSearch && matchesType;
  });

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contactPerson.trim() || !phone.trim()) return;

    const newItem: LostItem = {
      id: `item-${Date.now()}`,
      itemType,
      title,
      description,
      kombiRoute,
      kombiReg: kombiReg || undefined,
      dateLost: "Just now",
      contactPerson,
      phone,
      status: isDriverFound ? "recovered" : "lost",
      isDriverReport: isDriverFound
    };

    setItems([newItem, ...items]);
    setShowModal(false);
    setTitle("");
    setDescription("");
    setKombiReg("");
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <PackageSearch className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-white tracking-tight">
              Kombi Lost & Found Property Noticeboard
            </h2>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Commuter & Driver Safe Return
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Report items left behind in Harare omnibuses or check items handed in by honest kombi drivers & rank marshalls.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report Lost / Found Property</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by item, kombi plate, route (e.g. Kuwadzana, Samsung, AFX)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {["all", "national_id", "phone", "bag", "wallet"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterType(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                filterType === cat
                  ? "bg-amber-500 text-slate-950 font-black shadow"
                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {cat === "all" ? "All Items" : cat.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isFound = item.status === "recovered";
          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 space-y-3 transition ${
                isFound
                  ? "bg-emerald-950/20 border-emerald-500/30"
                  : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                  isFound
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                }`}>
                  {isFound ? "Handed in by Conductor" : "Lost by Commuter"}
                </span>

                <span className="text-[10px] text-slate-500 font-mono">
                  {item.dateLost}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-black text-white">{item.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.description}</p>
              </div>

              <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <Bus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{item.kombiRoute}</span>
                </div>
                {item.kombiReg && (
                  <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                    <span className="text-slate-500">Plate:</span>
                    <strong className="text-amber-300">{item.kombiReg}</strong>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  Contact: <strong className="text-white">{item.contactPerson}</strong>
                </div>
                <a
                  href={`tel:${item.phone.replace(/\s+/g, "")}`}
                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-lg flex items-center gap-1 transition shadow"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for reporting */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <PackageSearch className="w-5 h-5 text-amber-400" />
                <span>Post Kombi Property Notice</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3 text-xs">
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDriverFound(false)}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-xs ${
                    !isDriverFound ? "bg-rose-500 text-white" : "text-slate-400"
                  }`}
                >
                  I Lost An Item (Passenger)
                </button>
                <button
                  type="button"
                  onClick={() => setIsDriverFound(true)}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-xs ${
                    isDriverFound ? "bg-emerald-500 text-slate-950" : "text-slate-400"
                  }`}
                >
                  I Found An Item (Driver/Hwindi)
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Item Title & Model</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samsung A24 Blue Case or Brown Leather Wallet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category</label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="national_id">National ID / Documents</option>
                    <option value="phone">Phone / Tablet</option>
                    <option value="bag">Bag / Backpack</option>
                    <option value="wallet">Wallet / Cash</option>
                    <option value="keys">Keys</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Kombi Registration Plate</label>
                  <input
                    type="text"
                    placeholder="e.g. AFX 8912"
                    value={kombiReg}
                    onChange={(e) => setKombiReg(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Kombi Route / Time</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copacabana to Kuwadzana (around 17:30)"
                  value={kombiRoute}
                  onChange={(e) => setKombiRoute(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  placeholder="Seat location, distinctive marks, contents..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Contact Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow"
                >
                  Post Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
