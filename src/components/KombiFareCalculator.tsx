import React, { useState } from "react";
import {
  Calculator,
  DollarSign,
  Coins,
  ArrowRightLeft,
  Users,
  Bus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Wallet
} from "lucide-react";
import { KOMBI_RANKS } from "../data/harareData";

interface RouteFareInfo {
  id: string;
  routeName: string;
  origin: string;
  destination: string;
  distanceKm: number;
  offPeakUSD: number;
  peakUSD: number;
  offPeakZiG: number;
  peakZiG: number;
  notes: string;
}

const HARARE_FARES: RouteFareInfo[] = [
  {
    id: "route-kuw",
    routeName: "Copacabana to Kuwadzana (1-7)",
    origin: "Copacabana Terminus (CBD)",
    destination: "Kuwadzana Roundabout / Shops",
    distanceKm: 12.5,
    offPeakUSD: 0.75,
    peakUSD: 1.00,
    offPeakZiG: 21,
    peakZiG: 28,
    notes: "Peak hours usually start 16:30. Short drops (Showgrounds/Poly) are $0.50 USD."
  },
  {
    id: "route-chit",
    routeName: "4th Street (Simon Muzenda) to Chitungwiza (Makoni)",
    origin: "Simon Muzenda Rank (CBD)",
    destination: "Chitungwiza (Makoni / Town Centre)",
    distanceKm: 26.0,
    offPeakUSD: 1.00,
    peakUSD: 1.50,
    offPeakZiG: 28,
    peakZiG: 42,
    notes: "High rush-hour demand on Seke corridor. Night trips after 20:00 may reach $1.50."
  },
  {
    id: "route-glen",
    routeName: "Market Square to Glen View & Budiriro",
    origin: "Market Square (CBD)",
    destination: "Glen View 3 / Budiriro 1-5",
    distanceKm: 14.0,
    offPeakUSD: 0.75,
    peakUSD: 1.00,
    offPeakZiG: 21,
    peakZiG: 28,
    notes: "Via High Glen or Willowvale Rd. Frequent kombis at Market Square."
  },
  {
    id: "route-mab",
    routeName: "4th Street to Mabvuku & Tafara",
    origin: "Simon Muzenda Rank (CBD)",
    destination: "Mabvuku / Tafara Terminus",
    distanceKm: 21.0,
    offPeakUSD: 1.00,
    peakUSD: 1.25,
    offPeakZiG: 28,
    peakZiG: 35,
    notes: "Direct via Mutare Road. Short drop to Msasa is $0.50."
  },
  {
    id: "route-avondale",
    routeName: "Copacabana to Avondale & Mount Pleasant",
    origin: "Copacabana (CBD)",
    destination: "Avondale Bon Marche / UZ Gate",
    distanceKm: 6.5,
    offPeakUSD: 0.50,
    peakUSD: 0.75,
    offPeakZiG: 14,
    peakZiG: 21,
    notes: "Frequent student transit to University of Zimbabwe. Quick 12 min turnaround."
  },
  {
    id: "route-warren",
    routeName: "Copacabana to Warren Park D & Heroes Acre",
    origin: "Copacabana (CBD)",
    destination: "Warren Park D / Magaba",
    distanceKm: 8.0,
    offPeakUSD: 0.50,
    peakUSD: 0.75,
    offPeakZiG: 14,
    peakZiG: 21,
    notes: "Very frequent loading from Bay 4 at Copacabana."
  },
  {
    id: "route-hatfield",
    routeName: "Charge Office to Hatfield & Cranborne",
    origin: "Charge Office (CBD)",
    destination: "Hatfield / Queensway",
    distanceKm: 9.2,
    offPeakUSD: 0.50,
    peakUSD: 0.75,
    offPeakZiG: 14,
    peakZiG: 21,
    notes: "Departs from Charge Office south side. Smooth traffic via Airport Rd."
  },
  {
    id: "route-norton",
    routeName: "Copacabana to Norton (Katanga / Maridale)",
    origin: "Copacabana (CBD)",
    destination: "Norton Katanga",
    distanceKm: 42.0,
    offPeakUSD: 1.50,
    peakUSD: 2.00,
    offPeakZiG: 42,
    peakZiG: 56,
    notes: "Long distance arterial. Check tollgate & highway traffic."
  }
];

interface KombiFareCalculatorProps {
  initialRole?: "passenger" | "driver" | "conductor";
  onSelectRouteOnMap?: (routeId: string) => void;
}

export const KombiFareCalculator: React.FC<KombiFareCalculatorProps> = ({
  initialRole = "passenger",
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState(HARARE_FARES[0].id);
  const [isRushHour, setIsRushHour] = useState(false);
  const [passengerCount, setPassengerCount] = useState(1);
  const [tenderedUSD, setTenderedUSD] = useState<number>(5);
  const [tenderedCustom, setTenderedCustom] = useState<string>("");
  const [mode, setMode] = useState<"passenger" | "conductor">(
    initialRole === "conductor" || initialRole === "driver" ? "conductor" : "passenger"
  );
  const [customZiGRate, setCustomZiGRate] = useState<number>(28); // 1 USD = 28 ZiG

  // Conductor shift load calculator
  const [vehicleCapacity, setVehicleCapacity] = useState<15 | 18>(15);
  const [bookedSeats, setBookedSeats] = useState<number>(15);

  const activeRoute = HARARE_FARES.find((r) => r.id === selectedRouteId) || HARARE_FARES[0];

  const currentFarePerPersonUSD = isRushHour ? activeRoute.peakUSD : activeRoute.offPeakUSD;
  const currentFarePerPersonZiG = Math.round(currentFarePerPersonUSD * customZiGRate);

  const totalFareUSD = +(currentFarePerPersonUSD * passengerCount).toFixed(2);
  const totalFareZiG = Math.round(totalFareUSD * customZiGRate);

  const effectiveTendered = tenderedCustom ? parseFloat(tenderedCustom) || 0 : tenderedUSD;
  const changeUSD = +(effectiveTendered - totalFareUSD).toFixed(2);
  const changeZiG = Math.round(Math.max(0, changeUSD) * customZiGRate);

  // Full kombi trip tally
  const fullTripGrossUSD = +(currentFarePerPersonUSD * bookedSeats).toFixed(2);
  const fullTripGrossZiG = Math.round(fullTripGrossUSD * customZiGRate);

  return (
    <div className="bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calculator className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-white tracking-tight">
              Kombi Fare & Change Assistant
            </h2>
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              USD • ZiG Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Exact kombi fares for Harare routes, rush-hour rates, and instant change calculation for conductors and commuters.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode("passenger")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              mode === "passenger"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Passenger View</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("conductor")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              mode === "conductor"
                ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>Conductor (Hwindi) View</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Route Selection & Passenger Inputs */}
        <div className="lg:col-span-7 space-y-4">
          {/* Route Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Harare Kombi Route
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HARARE_FARES.map((r) => {
                const isSelected = r.id === selectedRouteId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRouteId(r.id)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/60 shadow-md"
                        : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-xs font-black truncate ${isSelected ? "text-amber-300" : "text-white"}`}>
                        {r.routeName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {r.distanceKm} km
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 truncate">{r.destination}</span>
                      <span className="font-bold text-emerald-400 shrink-0">
                        ${r.offPeakUSD.toFixed(2)} / ${r.peakUSD.toFixed(2)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time of Day & Rate Settings */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Transit Timing:</span>
              <button
                type="button"
                onClick={() => setIsRushHour(false)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  !isRushHour
                    ? "bg-slate-800 text-white border border-slate-700"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Off-Peak (Day)
              </button>
              <button
                type="button"
                onClick={() => setIsRushHour(true)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  isRushHour
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Sparkles className="w-3 h-3 text-rose-400" />
                <span>Peak Rush Hour</span>
              </button>
            </div>

            {/* Exchange Rate Tool */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">1 USD =</span>
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5">
                <input
                  type="number"
                  value={customZiGRate}
                  onChange={(e) => setCustomZiGRate(Math.max(1, parseInt(e.target.value) || 28))}
                  className="w-10 bg-transparent text-emerald-400 font-bold text-xs focus:outline-none text-right"
                />
                <span className="text-slate-400 text-[10px] font-bold">ZiG</span>
              </div>
            </div>
          </div>

          {/* Passengers / Seats Selector */}
          {mode === "passenger" ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Number of Commuters / Seats Needed
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPassengerCount(n)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                      passengerCount === n
                        ? "bg-amber-500 text-slate-950 shadow-md font-black"
                        : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {n} {n === 1 ? "Passenger" : "Seats"}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Conductor Capacity Selector */
            <div className="space-y-2 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-300">Omnibus Vehicle Class:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVehicleCapacity(15);
                      setBookedSeats(15);
                    }}
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      vehicleCapacity === 15
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    15-Seater (Quantum)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVehicleCapacity(18);
                      setBookedSeats(18);
                    }}
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      vehicleCapacity === 18
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    18-Seater (HiAce Super)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Seats Loaded This Trip:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={1}
                    max={vehicleCapacity}
                    value={bookedSeats}
                    onChange={(e) => setBookedSeats(parseInt(e.target.value))}
                    className="w-32 accent-emerald-500 cursor-pointer"
                  />
                  <span className="font-mono font-black text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {bookedSeats} / {vehicleCapacity}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Cash Tendered / Change calculation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-300 uppercase tracking-wider">
                {mode === "passenger" ? "Passenger Bill Given (USD / Cash):" : "Passenger Gives Note:"}
              </label>
              <span className="text-slate-500 text-[11px]">Quick Bill Presets</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[1, 2, 5, 10, 20].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setTenderedUSD(amt);
                    setTenderedCustom("");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    !tenderedCustom && tenderedUSD === amt
                      ? "bg-emerald-500 text-slate-950 font-black shadow"
                      : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  ${amt}.00
                </button>
              ))}

              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
                <span className="text-slate-500 text-xs">$</span>
                <input
                  type="number"
                  placeholder="Custom"
                  value={tenderedCustom}
                  onChange={(e) => setTenderedCustom(e.target.value)}
                  className="w-16 bg-transparent text-white font-mono text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculations & Change Display */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Total Fare Card */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
              <Bus className="w-24 h-24 text-amber-400" />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-400/90 block">
                  Trip Fare Total
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  ${totalFareUSD.toFixed(2)}{" "}
                  <span className="text-sm font-bold text-slate-400">USD</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  In ZiG Currency
                </span>
                <span className="text-lg sm:text-xl font-mono font-black text-emerald-400">
                  {totalFareZiG} <span className="text-xs font-bold text-slate-400">ZiG</span>
                </span>
              </div>
            </div>

            {/* Fare Breakdown Details */}
            <div className="pt-3 border-t border-slate-800/90 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Base Fare Per Person:</span>
                <span className="text-slate-200 font-bold">
                  ${currentFarePerPersonUSD.toFixed(2)} USD ({currentFarePerPersonZiG} ZiG)
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Passengers / Seats:</span>
                <span className="text-slate-200 font-bold">{passengerCount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Peak Surge:</span>
                <span className={isRushHour ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                  {isRushHour ? "+$0.25 - $0.50 Peak Rate Active" : "None (Standard Regular Rate)"}
                </span>
              </div>
            </div>

            {/* Change Calculator Output */}
            <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-800/80 bg-slate-900/90 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>Change to Return / Expect:</span>
                </span>
                <span className="text-xs text-slate-400">
                  Paid: <strong className="text-white">${effectiveTendered.toFixed(2)}</strong>
                </span>
              </div>

              {changeUSD < 0 ? (
                <div className="flex items-center gap-2 p-2 bg-rose-500/20 border border-rose-500/40 rounded-lg text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Short by <strong>${Math.abs(changeUSD).toFixed(2)} USD</strong> ({Math.abs(changeZiG)} ZiG).
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline justify-between">
                  <div className="text-xl font-black text-amber-300">
                    ${changeUSD.toFixed(2)}{" "}
                    <span className="text-xs font-bold text-slate-400">USD Change</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-emerald-400">
                    or {changeZiG} ZiG
                  </div>
                </div>
              )}

              {/* Conductor Change Advice */}
              <div className="text-[11px] text-slate-400 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                💡 <strong>Conductor Tip:</strong> If change in USD coins is scarce, offer {changeZiG} ZiG via EcoCash, or pair with small items (sweets/airtime) common at Harare CBD ranks.
              </div>
            </div>

            {/* Route notes */}
            <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
              📍 <strong>Route Intel:</strong> {activeRoute.notes}
            </div>
          </div>

          {/* Conductor Load Gross Earnings (if conductor mode) */}
          {mode === "conductor" && (
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>Full Kombi Load Gross (This Trip)</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  {bookedSeats} Seats
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-white">
                  ${fullTripGrossUSD.toFixed(2)} USD
                </span>
                <span className="text-sm font-mono text-emerald-400 font-bold">
                  {fullTripGrossZiG} ZiG
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                After City Council rank token ($1.00) and Rank Marshal ($1.00), estimated net trip revenue is ~<strong>${Math.max(0, fullTripGrossUSD - 2).toFixed(2)} USD</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
