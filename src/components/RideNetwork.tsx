import React, { useState, useMemo } from "react";
import {
  Car,
  User,
  Users,
  MapPin,
  Clock,
  DollarSign,
  Plus,
  Search,
  Star,
  ShieldCheck,
  CheckCircle2,
  Phone,
  ArrowRight,
  CreditCard,
  Sparkles,
  Zap,
  Sliders,
  Compass,
  Navigation,
  Check
} from "lucide-react";
import { Ride } from "../types";
import { POPULAR_LOCATIONS } from "../data/harareData";

interface RideNetworkProps {
  rides: Ride[];
  onBookRide: (ride: Ride) => void;
  onPostRide: (newRide: Partial<Ride>) => void;
  onSelectOnMap?: (coords: [number, number]) => void;
}

// Haversine formula calculation for proximity matching
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
}

export const RideNetwork: React.FC<RideNetworkProps> = ({
  rides,
  onBookRide,
  onPostRide,
  onSelectOnMap,
}) => {
  const [activeTab, setActiveTab] = useState<"matcher" | "drivers" | "passengers">("matcher");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<"driver_offer" | "passenger_request">("driver_offer");

  // Proximity Matching Engine States
  const [userRole, setUserRole] = useState<"passenger" | "driver">("passenger");
  const [userLocationName, setUserLocationName] = useState("Copacabana (Harare CBD)");
  const [userCoords, setUserCoords] = useState<[number, number]>([-17.8315, 31.0440]);
  const [userDestination, setUserDestination] = useState("Chitungwiza");
  const [searchRadiusKm, setSearchRadiusKm] = useState(12);
  const [minSeatsNeeded, setMinSeatsNeeded] = useState(1);
  const [sortBy, setSortBy] = useState<"score" | "distance" | "fare">("score");

  // Create Ride Form States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+263 ");
  const [vehicle, setVehicle] = useState("");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState(3);
  const [fareUSD, setFareUSD] = useState(1.5);
  const [notes, setNotes] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<string[]>(["EcoCash", "Cash", "InnBucks"]);

  // Set user coords when selecting preset location
  const handleSelectPresetLocation = (locName: string, coords: [number, number]) => {
    setUserLocationName(locName);
    setUserCoords(coords);
  };

  // Proximity-Based Matching Algorithm
  const proximityMatches = useMemo(() => {
    const targetType = userRole === "passenger" ? "driver_offer" : "passenger_request";
    const candidates = rides.filter((r) => r.type === targetType && r.status !== "completed");

    const matched = candidates.map((ride) => {
      // Calculate distance between user coords and ride pickup coords
      const distance = calculateHaversineKm(
        userCoords[0],
        userCoords[1],
        ride.pickupCoords[0],
        ride.pickupCoords[1]
      );

      // Estimated walking time (average 12 minutes per kilometer)
      const walkingMinutes = Math.max(1, Math.round(distance * 12));

      // Calculate compatibility score (1 - 100)
      let score = 100;

      // Distance penalty: reduce 4 points per km
      score -= Math.min(60, distance * 4);

      // Destination corridor alignment bonus
      const userDestWords = userDestination.toLowerCase().split(/\s+/).filter(Boolean);
      const rideDestLower = ride.destination.toLowerCase();
      const hasDestMatch = userDestWords.some((word) => word.length > 2 && rideDestLower.includes(word));

      if (hasDestMatch) {
        score += 25;
      } else if (userDestination.trim().length > 0) {
        score -= 20; // Destination doesn't match
      }

      // Seat availability check
      if (userRole === "passenger") {
        if ((ride.seatsAvailable || 0) < minSeatsNeeded) {
          score -= 30;
        }
      }

      // Clamp between 10 and 99
      const finalScore = Math.max(15, Math.min(99, Math.round(score)));

      return {
        ...ride,
        distanceKm: distance,
        walkingMinutes,
        matchScore: finalScore,
      };
    });

    // Filter within search radius
    const withinRadius = matched.filter((r) => (r.distanceKm || 0) <= searchRadiusKm);

    // Sort according to selection
    return withinRadius.sort((a, b) => {
      if (sortBy === "distance") {
        return (a.distanceKm || 0) - (b.distanceKm || 0);
      }
      if (sortBy === "fare") {
        const fareA = a.farePerSeatUSD || a.budgetUSD || 0;
        const fareB = b.farePerSeatUSD || b.budgetUSD || 0;
        return fareA - fareB;
      }
      // Default: sort by matchScore descending, then proximity ascending
      return (b.matchScore || 0) - (a.matchScore || 0) || (a.distanceKm || 0) - (b.distanceKm || 0);
    });
  }, [rides, userRole, userCoords, userDestination, searchRadiusKm, minSeatsNeeded, sortBy]);

  // General Filter for Drivers / Passengers tabs
  const filteredRides = rides.filter((r) => {
    const isTargetType =
      activeTab === "drivers" ? r.type === "driver_offer" : r.type === "passenger_request";
    const matchesQuery =
      r.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.driverName && r.driverName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.passengerName && r.passengerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return isTargetType && matchesQuery;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup.trim() || !destination.trim()) return;

    // Pick approximate coords based on pickup or CBD
    const matchedLoc = POPULAR_LOCATIONS.find((l) =>
      pickup.toLowerCase().includes(l.name.toLowerCase().split(" ")[0])
    );
    const coords: [number, number] = matchedLoc
      ? matchedLoc.coords
      : [-17.8292 + (Math.random() - 0.5) * 0.04, 31.0522 + (Math.random() - 0.5) * 0.04];

    if (createType === "driver_offer") {
      onPostRide({
        type: "driver_offer",
        driverName: name || "Harare Motorist",
        driverPhone: phone || "+263 77 123 4567",
        vehicle: vehicle || "Toyota Wish (White)",
        pickupLocation: pickup,
        pickupCoords: coords,
        destination,
        departureTime: time || "Departing in 15 mins",
        seatsAvailable: seats,
        farePerSeatUSD: fareUSD,
        farePerSeatZiG: +(fareUSD * 30).toFixed(0),
        acceptedPayment: paymentMethods,
        notes: notes || "Direct route, comfortable ride.",
      });
    } else {
      onPostRide({
        type: "passenger_request",
        passengerName: name || "Harare Commuter",
        passengerPhone: phone || "+263 71 987 6543",
        pickupLocation: pickup,
        pickupCoords: coords,
        destination,
        preferredTime: time || "Ready for pickup now",
        seatsNeeded: seats,
        budgetUSD: fareUSD,
        acceptedPayment: paymentMethods,
        notes: notes || "Waiting on curb, cash or EcoCash ready.",
      });
    }

    // Reset form & close modal
    setName("");
    setVehicle("");
    setPickup("");
    setDestination("");
    setNotes("");
    setShowCreateModal(false);
  };

  const togglePaymentMethod = (method: string) => {
    if (paymentMethods.includes(method)) {
      setPaymentMethods(paymentMethods.filter((m) => m !== method));
    } else {
      setPaymentMethods([...paymentMethods, method]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3.5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-cyan-400" />
            Harare Ride-Sharing & Proximity Network
            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
              Live Transit Match
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Smart proximity algorithm connecting drivers with empty seats and passengers at pickup spots
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCreateType("driver_offer");
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
          >
            <Car className="w-3.5 h-3.5" />
            <span>Offer Transport</span>
          </button>
          <button
            onClick={() => {
              setCreateType("passenger_request");
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Request Transport</span>
          </button>
        </div>
      </div>

      {/* Regulatory & Trust Escrow Notice */}
      <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-2.5 flex items-center justify-between text-[11px] text-emerald-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Secure Regulated Rideshare:</strong> Escrow payment held safely until arrival. 2% IMTT tax calculated in accordance with the RBZ National Payment System Act.
          </span>
        </div>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono hidden md:inline-block">
          PCI-DSS Compliant & Mutual Reviews
        </span>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab("matcher")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "matcher"
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>⚡ Proximity Matcher</span>
        </button>

        <button
          onClick={() => setActiveTab("drivers")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "drivers"
              ? "bg-cyan-500 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Drivers Offering Rides ({rides.filter((r) => r.type === "driver_offer").length})</span>
        </button>

        <button
          onClick={() => setActiveTab("passengers")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "passengers"
              ? "bg-pink-500 text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Passengers Looking ({rides.filter((r) => r.type === "passenger_request").length})</span>
        </button>
      </div>

      {/* VIEW 1: PROXIMITY-BASED MATCHING ENGINE */}
      {activeTab === "matcher" && (
        <div className="space-y-3">
          {/* Matcher Configuration Card */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3.5 space-y-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">
                  Proximity Matching Criteria (Haversine Distance & Corridor Algorithm)
                </span>
              </div>
              {/* Role Switcher */}
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setUserRole("passenger")}
                  className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                    userRole === "passenger"
                      ? "bg-cyan-500 text-slate-950 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  I'm a Passenger
                </button>
                <button
                  type="button"
                  onClick={() => setUserRole("driver")}
                  className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                    userRole === "driver"
                      ? "bg-pink-500 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  I'm a Driver
                </button>
              </div>
            </div>

            {/* Inputs: Pickup Spot + Destination + Radius */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {userRole === "passenger" ? "Where are you waiting?" : "Your current location / start point:"}
                </label>
                <input
                  type="text"
                  value={userLocationName}
                  onChange={(e) => {
                    setUserLocationName(e.target.value);
                    const found = POPULAR_LOCATIONS.find((l) =>
                      e.target.value.toLowerCase().includes(l.name.toLowerCase().split(" ")[0])
                    );
                    if (found) setUserCoords(found.coords);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                />
                {/* Location Quick Picks */}
                <div className="flex items-center gap-1 mt-1.5 overflow-x-auto no-scrollbar">
                  {POPULAR_LOCATIONS.slice(0, 4).map((loc) => (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => handleSelectPresetLocation(loc.name, loc.coords)}
                      className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white px-1.5 py-0.5 rounded whitespace-nowrap cursor-pointer"
                    >
                      {loc.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  Desired Destination:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chitungwiza, Kuwadzana, Avondale..."
                  value={userDestination}
                  onChange={(e) => setUserDestination(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                />
                {/* Destination Quick Picks */}
                <div className="flex items-center gap-1 mt-1.5 overflow-x-auto no-scrollbar">
                  {["Chitungwiza", "Kuwadzana", "Borrowdale", "CBD"].map((dest) => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => setUserDestination(dest)}
                      className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white px-1.5 py-0.5 rounded whitespace-nowrap cursor-pointer"
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-semibold flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    Max Pickup Radius:
                  </label>
                  <span className="font-bold text-amber-400">{searchRadiusKm} km</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={searchRadiusKm}
                  onChange={(e) => setSearchRadiusKm(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                  <span>1 km (walking)</span>
                  <span>10 km</span>
                  <span>25 km (Greater Harare)</span>
                </div>
              </div>
            </div>

            {/* Results Filter & Sorter Summary */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80 text-slate-400">
              <span>
                Found <strong className="text-amber-400">{proximityMatches.length}</strong> matching{" "}
                {userRole === "passenger" ? "driver offers" : "passenger requests"} near you:
              </span>
              <div className="flex items-center gap-2 text-[11px]">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-0.5 focus:outline-none"
                >
                  <option value="score">⚡ Match Compatibility</option>
                  <option value="distance">📍 Distance (Closest First)</option>
                  <option value="fare">💵 Lowest Fare / Budget</option>
                </select>
              </div>
            </div>
          </div>

          {/* Matched Listings */}
          <div className="space-y-2.5">
            {proximityMatches.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
                <p>No transport matches found within {searchRadiusKm} km of your spot heading to "{userDestination}".</p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setSearchRadiusKm(25)}
                    className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Expand Search to 25 km
                  </button>
                  <button
                    onClick={() => {
                      setCreateType(userRole === "passenger" ? "passenger_request" : "driver_offer");
                      setShowCreateModal(true);
                    }}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Broadcast Your Request
                  </button>
                </div>
              </div>
            ) : (
              proximityMatches.map((ride) => {
                const isDriver = ride.type === "driver_offer";
                const score = ride.matchScore || 85;

                return (
                  <div
                    key={ride.id}
                    className="bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 rounded-xl p-3.5 transition shadow-sm space-y-2.5"
                  >
                    {/* Header Row: Score Badge + Distance + Fare */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {/* Compatibility Score */}
                        <span
                          className={`flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                            score >= 85
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-xs"
                              : score >= 70
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          {score}% Match
                        </span>

                        {/* Distance & Walking Time */}
                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-300 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {ride.distanceKm} km away • ~{ride.walkingMinutes} min walk
                        </span>
                      </div>

                      {/* Fare & Currency */}
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-emerald-400">
                          ${isDriver ? ride.farePerSeatUSD?.toFixed(2) : ride.budgetUSD?.toFixed(2)} USD
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isDriver ? `${ride.farePerSeatZiG || 45} ZiG (2% IMTT incl.)` : "Budget per seat"}
                        </div>
                      </div>
                    </div>

                    {/* Person Details */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                            isDriver ? "bg-cyan-600" : "bg-pink-600"
                          }`}
                        >
                          {isDriver ? <Car className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-white">
                              {isDriver ? ride.driverName : ride.passengerName}
                            </span>
                            <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-400">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {ride.rating.toFixed(1)}
                            </span>
                            {isDriver && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30 flex items-center gap-0.5">
                                <ShieldCheck className="w-2.5 h-2.5" /> Verified
                              </span>
                            )}
                          </div>
                          {isDriver && ride.vehicle && (
                            <p className="text-[11px] text-slate-400">{ride.vehicle}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {isDriver ? ride.departureTime : ride.preferredTime}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-cyan-300">
                          <Users className="w-3 h-3" />
                          {isDriver ? `${ride.seatsAvailable} seats open` : `${ride.seatsNeeded} seats needed`}
                        </span>
                      </div>
                    </div>

                    {/* Route Corridor */}
                    <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
                        <span className="text-slate-400 text-[11px]">Pick-up spot:</span>
                        <span className="text-slate-200 font-semibold truncate">{ride.pickupLocation}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                        <span className="text-slate-400 text-[11px]">Destination:</span>
                        <span className="text-slate-200 font-semibold truncate">{ride.destination}</span>
                      </div>
                    </div>

                    {/* Notes & Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {ride.acceptedPayment?.map((p) => (
                          <span key={p} className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                            {p}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {onSelectOnMap && (
                          <button
                            onClick={() => onSelectOnMap(ride.pickupCoords)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg transition cursor-pointer"
                          >
                            Locate
                          </button>
                        )}
                        <button
                          onClick={() => onBookRide(ride)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs rounded-lg shadow transition cursor-pointer flex items-center gap-1.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{isDriver ? "Book Seat & Escrow" : "Offer Seat"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 2 & 3: DRIVERS & PASSENGERS DIRECT LIST */}
      {activeTab !== "matcher" && (
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by destination, road, or name (e.g. Chitungwiza, Kuwadzana, 4th St)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Rides List */}
          <div className="space-y-3">
            {filteredRides.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No listings found for this search. Be the first to post transport!
              </div>
            ) : (
              filteredRides.map((ride) => {
                const isDriver = ride.type === "driver_offer";

                return (
                  <div
                    key={ride.id}
                    className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 transition shadow-sm space-y-3"
                  >
                    {/* Header: User details + rating + badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                            isDriver ? "bg-cyan-600" : "bg-pink-600"
                          }`}
                        >
                          {isDriver ? <Car className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-white">
                              {isDriver ? ride.driverName : ride.passengerName}
                            </h4>
                            <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-400">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {ride.rating.toFixed(1)}
                            </span>
                            {isDriver && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-1.5 py-0.2 rounded border border-emerald-500/30 flex items-center gap-0.5">
                                <ShieldCheck className="w-2.5 h-2.5" /> Verified
                              </span>
                            )}
                          </div>
                          {isDriver && ride.vehicle && (
                            <p className="text-[11px] text-slate-400">{ride.vehicle}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-extrabold text-emerald-400">
                          ${isDriver ? ride.farePerSeatUSD?.toFixed(2) : ride.budgetUSD?.toFixed(2)} USD
                        </div>
                        {isDriver && ride.farePerSeatZiG && (
                          <div className="text-[10px] text-slate-400">{ride.farePerSeatZiG} ZiG</div>
                        )}
                      </div>
                    </div>

                    {/* Route: Origin to Destination */}
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 text-xs space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
                        <span className="text-slate-400 text-[11px]">Pick-up spot:</span>
                        <span className="text-slate-200 font-semibold truncate">{ride.pickupLocation}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                        <span className="text-slate-400 text-[11px]">Destination:</span>
                        <span className="text-slate-200 font-semibold truncate">{ride.destination}</span>
                      </div>
                    </div>

                    {/* Notes & Badges */}
                    {ride.notes && (
                      <p className="text-xs text-slate-300 italic bg-slate-900/40 px-2.5 py-1.5 rounded border border-slate-800/50">
                        "{ride.notes}"
                      </p>
                    )}

                    {/* Mutual Rating & Review Badges if completed */}
                    {(ride.passengerRating || ride.driverRating) && (
                      <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>Mutual Feedback</span>
                          <span className="text-emerald-400">Verified Trip</span>
                        </div>

                        {ride.passengerRating && (
                          <div className="text-slate-300">
                            <span className="text-cyan-400 font-semibold">Passenger Review:</span>{" "}
                            "{ride.passengerRating.comment}" ({ride.passengerRating.stars}⭐)
                          </div>
                        )}

                        {ride.driverRating && (
                          <div className="text-slate-300">
                            <span className="text-pink-400 font-semibold">Driver Review:</span>{" "}
                            "{ride.driverRating.comment}" ({ride.driverRating.stars}⭐)
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer Info & Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/70 text-xs">
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {isDriver ? ride.departureTime : ride.preferredTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          {isDriver ? `${ride.seatsAvailable} seats left` : `${ride.seatsNeeded} needed`}
                        </span>
                        {ride.paymentStatus === "escrow_held" && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                            Escrow Locked
                          </span>
                        )}
                        {ride.status === "completed" && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                            Settled & Completed
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {onSelectOnMap && (
                          <button
                            onClick={() => onSelectOnMap(ride.pickupCoords)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg transition cursor-pointer"
                          >
                            Locate
                          </button>
                        )}
                        <button
                          onClick={() => onBookRide(ride)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer ${
                            ride.status === "completed"
                              ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                              : ride.paymentStatus === "escrow_held"
                              ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow"
                              : isDriver
                              ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow"
                              : "bg-pink-500 hover:bg-pink-400 text-white shadow"
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>
                            {ride.status === "completed"
                              ? "Mutual Ratings & Receipt"
                              : ride.paymentStatus === "escrow_held"
                              ? "Confirm Drop-off & Rate"
                              : isDriver
                              ? "Book & Pay"
                              : "Offer Transport"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Create Ride Modal (Driver Offer or Passenger Request) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-5 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                    createType === "driver_offer" ? "bg-cyan-600" : "bg-pink-600"
                  }`}
                >
                  {createType === "driver_offer" ? <Car className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {createType === "driver_offer" ? "Offer Transport to Harare Commuters" : "Post Your Location & Request Transport"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {createType === "driver_offer"
                      ? "List empty seats with departure time and route"
                      : "Tell nearby drivers where you are standing and where you need to go"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Kudakwashe M."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="+263 77 412 8892"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-cyan-500"
                  />
                </div>
              </div>

              {createType === "driver_offer" && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Vehicle Model & Registration</label>
                  <input
                    type="text"
                    placeholder="e.g., Toyota Wish Silver (AFK 9123)"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-cyan-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {createType === "driver_offer" ? "Pick-up Point / Route Start in Harare" : "Where are you currently located / waiting?"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Copacabana Rank, 4th Street Rank, or Avondale Shopping Centre"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Destination</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Chitungwiza (Makoni), Kuwadzana Roundabout, or Borrowdale"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {createType === "driver_offer" ? "Departure Time" : "Preferred Time"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Leaving in 10 mins"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {createType === "driver_offer" ? "Available Seats" : "Seats Needed"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={seats}
                    onChange={(e) => setSeats(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {createType === "driver_offer" ? "Fare (USD)" : "Budget (USD)"}
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min={0.5}
                    value={fareUSD}
                    onChange={(e) => setFareUSD(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Accepted Payment Options</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {["EcoCash", "InnBucks", "Cash", "ZiG", "Card"].map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => togglePaymentMethod(opt)}
                      className={`px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer ${
                        paymentMethods.includes(opt)
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes / Route Preferences</label>
                <textarea
                  rows={2}
                  placeholder="e.g., Taking Airport Road bypass to dodge Seke Road gridlock."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg shadow cursor-pointer transition"
                >
                  Publish to Harare Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
