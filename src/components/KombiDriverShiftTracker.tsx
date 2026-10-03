import React, { useState } from "react";
import {
  Gauge,
  DollarSign,
  Fuel,
  Users,
  CheckCircle,
  AlertTriangle,
  Award,
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  Save
} from "lucide-react";

interface TripRecord {
  id: string;
  time: string;
  route: string;
  passengers: number;
  grossFareUSD: number;
  rankFeeUSD: number;
}

export const KombiDriverShiftTracker: React.FC = () => {
  // Target Configuration
  const [ownerTargetUSD, setOwnerTargetUSD] = useState<number>(70);
  const [fuelPricePerLitreUSD, setFuelPricePerLitreUSD] = useState<number>(1.55);
  const [fuelLitresBought, setFuelLitresBought] = useState<number>(20);
  const [councilRankDiscUSD, setCouncilRankDiscUSD] = useState<number>(2.0);
  const [otherExpensesUSD, setOtherExpensesUSD] = useState<number>(3.0);

  // Trips made today
  const [trips, setTrips] = useState<TripRecord[]>([
    {
      id: "trip-1",
      time: "06:15",
      route: "Kuwadzana to Copacabana",
      passengers: 15,
      grossFareUSD: 11.25,
      rankFeeUSD: 1.0
    },
    {
      id: "trip-2",
      time: "07:45",
      route: "Copacabana to Kuwadzana (Peak)",
      passengers: 15,
      grossFareUSD: 15.00,
      rankFeeUSD: 1.5
    },
    {
      id: "trip-3",
      time: "10:30",
      route: "Kuwadzana to Copacabana",
      passengers: 14,
      grossFareUSD: 10.50,
      rankFeeUSD: 1.0
    },
    {
      id: "trip-4",
      time: "13:10",
      route: "Copacabana to Kuwadzana",
      passengers: 15,
      grossFareUSD: 11.25,
      rankFeeUSD: 1.0
    }
  ]);

  // New trip input form
  const [newRoute, setNewRoute] = useState("Copacabana to Kuwadzana");
  const [newPassengers, setNewPassengers] = useState(15);
  const [newGross, setNewGross] = useState(11.25);
  const [newRankFee, setNewRankFee] = useState(1.0);

  const totalFuelCostUSD = +(fuelLitresBought * fuelPricePerLitreUSD).toFixed(2);
  const totalGrossTakingsUSD = +trips.reduce((acc, t) => acc + t.grossFareUSD, 0).toFixed(2);
  const totalRankFeesUSD = +trips.reduce((acc, t) => acc + t.rankFeeUSD, 0).toFixed(2);
  const totalDeductionsUSD = +(totalFuelCostUSD + totalRankFeesUSD + councilRankDiscUSD + otherExpensesUSD).toFixed(2);

  // Net Cash in Conductor's bag
  const netCashInHandUSD = +(totalGrossTakingsUSD - totalDeductionsUSD).toFixed(2);

  // Progress toward owner target
  const remainingForOwnerUSD = Math.max(0, +(ownerTargetUSD - totalGrossTakingsUSD).toFixed(2));
  const targetProgressPercent = Math.min(100, Math.round((totalGrossTakingsUSD / (ownerTargetUSD || 1)) * 100));

  // Driver & Conductor net takeaway once owner target is satisfied
  const driverConductorSplitUSD = Math.max(0, +(totalGrossTakingsUSD - ownerTargetUSD - totalFuelCostUSD - totalRankFeesUSD - councilRankDiscUSD - otherExpensesUSD).toFixed(2));

  const handleAddTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrip: TripRecord = {
      id: `trip-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      route: newRoute,
      passengers: newPassengers,
      grossFareUSD: newGross,
      rankFeeUSD: newRankFee
    };
    setTrips([newTrip, ...trips]);
  };

  const handleRemoveTrip = (id: string) => {
    setTrips(trips.filter((t) => t.id !== id));
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Gauge className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-white tracking-tight">
              Kombi Driver & Conductor Shift Target Tracker
            </h2>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Daily Target: ${ownerTargetUSD} USD
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Track daily gross trips, diesel fuel receipts, rank marshal fees, and calculate driver & conductor take-home profit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300 font-bold">Today's Shift</span>
          </div>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Owner Daily Target Progress
            </span>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
              ${totalGrossTakingsUSD.toFixed(2)}{" "}
              <span className="text-sm font-bold text-slate-400">
                / ${ownerTargetUSD.toFixed(2)} USD Target
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
              targetProgressPercent >= 100
                ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
            }`}>
              {targetProgressPercent >= 100 ? "TARGET REACHED! 🎯" : `${targetProgressPercent}% Cleared`}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              {targetProgressPercent >= 100
                ? "All extra money goes into Driver & Hwindi pocket!"
                : `$${remainingForOwnerUSD} USD remaining for Kombi Boss`}
            </p>
          </div>
        </div>

        {/* Progress meter */}
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              targetProgressPercent >= 100
                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                : "bg-gradient-to-r from-amber-500 to-orange-500"
            }`}
            style={{ width: `${targetProgressPercent}%` }}
          ></div>
        </div>

        {/* Summary Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Trips Made</span>
            <span className="text-base font-black text-white">{trips.length} Loads</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Diesel Fuel</span>
            <span className="text-base font-black text-rose-400">${totalFuelCostUSD.toFixed(2)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Rank Marshal Fees</span>
            <span className="text-base font-black text-amber-400">${totalRankFeesUSD.toFixed(2)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Driver/Hwindi Profit</span>
            <span className="text-base font-black text-emerald-400">${driverConductorSplitUSD.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Configuration & Log Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Log New Trip */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Record Completed Kombi Trip</span>
            </h3>

            <form onSubmit={handleAddTrip} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Route & Corridor</label>
                  <input
                    type="text"
                    value={newRoute}
                    onChange={(e) => setNewRoute(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Copacabana to Kuwadzana"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Passengers Carried</label>
                  <input
                    type="number"
                    value={newPassengers}
                    onChange={(e) => setNewPassengers(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    min={1}
                    max={25}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Gross Takings ($ USD)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={newGross}
                    onChange={(e) => setNewGross(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Rank Marshal Fee ($ USD)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newRankFee}
                    onChange={(e) => setNewRankFee(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow transition cursor-pointer"
              >
                + Add Trip to Today's Shift
              </button>
            </form>
          </div>

          {/* Trips Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Today's Trips Log ({trips.length})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {trips.map((t, idx) => (
                <div
                  key={t.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-slate-400 text-[10px]">
                      #{trips.length - idx}
                    </span>
                    <div>
                      <div className="font-bold text-white text-xs">{t.route}</div>
                      <div className="text-[10px] text-slate-400">
                        {t.time} • {t.passengers} Commuters • Marshal Fee: ${t.rankFeeUSD.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-emerald-400 text-sm">
                      +${t.grossFareUSD.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTrip(t.id)}
                      className="text-slate-600 hover:text-rose-400 p-1 cursor-pointer transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Daily Target Settings */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Shift Target & Operating Costs</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">
                  Kombi Owner Daily Target ($ USD):
                </label>
                <input
                  type="number"
                  value={ownerTargetUSD}
                  onChange={(e) => setOwnerTargetUSD(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-black text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Diesel Bought (Litres):</label>
                  <input
                    type="number"
                    value={fuelLitresBought}
                    onChange={(e) => setFuelLitresBought(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Fuel Price ($/Litre):</label>
                  <input
                    type="number"
                    step="0.05"
                    value={fuelPricePerLitreUSD}
                    onChange={(e) => setFuelPricePerLitreUSD(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  City Council Rank Token / Disc ($ USD):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={councilRankDiscUSD}
                  onChange={(e) => setCouncilRankDiscUSD(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Other Operating Costs ($ USD):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={otherExpensesUSD}
                  onChange={(e) => setOtherExpensesUSD(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              💡 <strong>Driver Rule of Thumb:</strong> In Harare urban transit, standard Quantum targets run between $60 and $80 USD. On rainy days or Friday evenings, targets are typically reached by 17:30.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
