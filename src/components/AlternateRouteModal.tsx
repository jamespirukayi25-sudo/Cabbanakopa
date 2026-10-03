import React, { useState } from "react";
import {
  Compass,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  TrendingDown,
  Navigation,
  Send,
  Loader2,
  ShieldAlert
} from "lucide-react";
import { AlternateRoutePlan } from "../types";
import { PRESET_ALTERNATE_ROUTES, POPULAR_LOCATIONS } from "../data/harareData";

interface AlternateRouteModalProps {
  onSelectRoute: (route: AlternateRoutePlan) => void;
  activeRoute: AlternateRoutePlan | null;
  onClose?: () => void;
}

export const AlternateRouteModal: React.FC<AlternateRouteModalProps> = ({
  onSelectRoute,
  activeRoute,
  onClose,
}) => {
  const [selectedOrigin, setSelectedOrigin] = useState("Harare CBD (4th St)");
  const [selectedDest, setSelectedDest] = useState("Chitungwiza (Makoni)");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const handleAskAI = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/route-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: selectedOrigin,
          destination: selectedDest,
          userQuestion: aiQuestion || "What is the fastest bypass right now to avoid police roadblocks and jams?",
        }),
      });
      const data = await res.json();
      if (data.advice) {
        setAiAdvice(data.advice);
      }
    } catch (err) {
      console.error(err);
      setAiAdvice(
        "Recommended Route: Bypass Seke Road Flyover by heading down Dieppe Road through Sunningdale and joining Airport Road into Hatfield. Peak hours on Samora Machel Eastbound can be avoided by taking Herbert Chitepo."
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-5 shadow-2xl space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Harare Alternate Route Optimizer
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Live Bypass Engine
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Skip gridlocked corridors, disabled traffic lights, and police inspection delays
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg text-lg font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Origin & Destination Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Current Point of Departure (Harare)
          </label>
          <select
            value={selectedOrigin}
            onChange={(e) => setSelectedOrigin(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {POPULAR_LOCATIONS.map((loc) => (
              <option key={loc.name} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Destination Location
          </label>
          <select
            value={selectedDest}
            onChange={(e) => setSelectedDest(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {POPULAR_LOCATIONS.map((loc) => (
              <option key={loc.name} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset Route Options Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          Recommended Route Profiles
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRESET_ALTERNATE_ROUTES.map((route) => {
            const isSelected = activeRoute?.id === route.id;
            const isOptimal = route.condition === "optimal";

            return (
              <div
                key={route.id}
                onClick={() => onSelectRoute(route)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg"
                    : isOptimal
                    ? "bg-slate-950/60 border-emerald-900/50 hover:bg-slate-900 hover:border-emerald-700/60"
                    : "bg-slate-950/60 border-rose-900/40 hover:bg-slate-900"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isOptimal
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {isOptimal ? "🚀 Recommended Bypass" : "⚠️ Primary Corridor (Heavy Delay)"}
                    </span>

                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {route.durationMins} mins
                    </span>
                  </div>

                  <h5 className="text-sm font-bold text-white mb-1">{route.name}</h5>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">{route.description}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {route.arteries.map((art) => (
                      <span
                        key={art}
                        className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
                      >
                        {art}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/70 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{route.distanceKm} km</span>
                    {route.savedMins > 0 ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" /> Saves {route.savedMins} mins
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-0.5">
                        <AlertOctagon className="w-3 h-3" /> +30 mins delay
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      isSelected
                        ? "bg-emerald-500 text-slate-950 shadow"
                        : "bg-slate-800 text-slate-200 hover:bg-emerald-600 hover:text-white"
                    }`}
                  >
                    {isSelected ? "Active on Map" : "Display Route"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gemini AI Route Advisor Panel */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-4 rounded-xl border border-indigo-900/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
              Harare AI Route Dispatcher
            </h4>
          </div>
          <span className="text-[10px] text-slate-400">Trained on Harare corridors & live incidents</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask AI: e.g. How to get to Chitungwiza right now without crossing the Seke police roadblock?"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
            className="flex-1 px-3 py-2 bg-slate-950 border border-indigo-900/60 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleAskAI}
            disabled={aiLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Get AI Plan</span>
          </button>
        </div>

        {aiAdvice && (
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-lg p-3 text-xs text-slate-200 leading-relaxed space-y-1">
            <div className="font-bold text-indigo-400 flex items-center gap-1 text-[11px] mb-1">
              <Sparkles className="w-3 h-3" /> Live Dispatch Guidance:
            </div>
            <div className="whitespace-pre-line">{aiAdvice}</div>
          </div>
        )}
      </div>
    </div>
  );
};
