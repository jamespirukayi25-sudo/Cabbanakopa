import React, { useState } from "react";
import {
  Video,
  Eye,
  Radio,
  MapPin,
  AlertTriangle,
  Play,
  Pause,
  Maximize2,
  Shield,
  Clock,
  Sparkles,
  Share2
} from "lucide-react";
import { CameraFeed, Incident } from "../types";

interface LiveCameraViewerProps {
  cameras: CameraFeed[];
  incidentsWithVideo: Incident[];
  onSelectCamera: (cam: CameraFeed) => void;
  selectedCamera: CameraFeed | null;
  onOpenReportWithLocation?: (loc: string) => void;
}

export const LiveCameraViewer: React.FC<LiveCameraViewerProps> = ({
  cameras,
  incidentsWithVideo,
  onSelectCamera,
  selectedCamera,
  onOpenReportWithLocation,
}) => {
  const [activeTab, setActiveTab] = useState<"cams" | "crowdsourced">("cams");
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeVideoIncident, setActiveVideoIncident] = useState<Incident | null>(null);

  const currentCam = selectedCamera || cameras[0];

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-400" />
            Harare Live Traffic Video Feeds
            <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-full border border-red-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              LIVE STREAMS
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time cameras & crowdsourced video updates on police presence, accidents, and congestion
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab("cams");
              setActiveVideoIncident(null);
            }}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === "cams"
                ? "bg-purple-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Intersection Cams ({cameras.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("crowdsourced");
              if (incidentsWithVideo.length > 0) setActiveVideoIncident(incidentsWithVideo[0]);
            }}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
              activeTab === "crowdsourced"
                ? "bg-amber-500 text-slate-950 shadow font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>Eyewitness Clips ({incidentsWithVideo.length})</span>
          </button>
        </div>
      </div>

      {/* Main Video Stage */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-700 shadow-2xl group">
        <video
          key={activeVideoIncident ? activeVideoIncident.id : currentCam?.id}
          src={
            activeVideoIncident
              ? activeVideoIncident.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
              : currentCam?.videoSource
          }
          poster={activeVideoIncident ? activeVideoIncident.videoThumbnail : currentCam?.poster}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Live Top Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              {activeVideoIncident ? "CROWDSOURCED DISPATCH" : "LIVE FEED"}
            </span>
            <span className="bg-slate-950/80 backdrop-blur-md text-slate-200 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              {activeVideoIncident ? "Verified Eyewitness" : `${currentCam?.viewers} live viewers`}
            </span>
          </div>

          <span className="bg-slate-950/80 backdrop-blur-md text-slate-300 text-xs px-2.5 py-1 rounded-md border border-slate-800 font-mono">
            {new Date().toLocaleTimeString()} CAT
          </span>
        </div>

        {/* Bottom Information Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{activeVideoIncident ? activeVideoIncident.location : currentCam?.intersection}</span>
            </div>
            {onOpenReportWithLocation && (
              <button
                onClick={() =>
                  onOpenReportWithLocation(
                    activeVideoIncident ? activeVideoIncident.location : currentCam?.intersection || "Harare"
                  )
                }
                className="pointer-events-auto text-[11px] bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 font-medium transition cursor-pointer"
              >
                Flag Alert on this Spot
              </button>
            )}
          </div>

          <p className="text-slate-200 font-medium text-xs">
            {activeVideoIncident ? activeVideoIncident.title : currentCam?.name}
          </p>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">
                Status: {activeVideoIncident ? activeVideoIncident.description : currentCam?.currentCondition}
              </span>
            </div>
            <span>Camera Node ID: {activeVideoIncident ? activeVideoIncident.id : currentCam?.id}</span>
          </div>
        </div>
      </div>

      {/* Selectors / Carousel */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {activeTab === "cams" ? "Harare Intersection Feeds" : "Crowdsourced Video Alerts"}
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {activeTab === "cams"
            ? cameras.map((cam) => {
                const isSelected = currentCam?.id === cam.id && !activeVideoIncident;
                return (
                  <button
                    key={cam.id}
                    onClick={() => {
                      setActiveVideoIncident(null);
                      onSelectCamera(cam);
                    }}
                    className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-purple-950/50 border-purple-500 ring-1 ring-purple-500 shadow-md"
                        : "bg-slate-950/60 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded">
                          LIVE
                        </span>
                        <span className="text-[10px] text-slate-400">{cam.viewers} 👁️</span>
                      </div>
                      <h5 className="text-xs font-bold text-white line-clamp-1">{cam.name}</h5>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{cam.intersection}</p>
                    </div>
                  </button>
                );
              })
            : incidentsWithVideo.map((inc) => {
                const isSelected = activeVideoIncident?.id === inc.id;
                return (
                  <button
                    key={inc.id}
                    onClick={() => setActiveVideoIncident(inc)}
                    className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-amber-950/50 border-amber-500 ring-1 ring-amber-500 shadow-md"
                        : "bg-slate-950/60 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] bg-purple-500/20 text-purple-400 font-bold px-1.5 py-0.5 rounded">
                          VIDEO
                        </span>
                        <span className="text-[10px] text-slate-400">{inc.timestamp}</span>
                      </div>
                      <h5 className="text-xs font-bold text-white line-clamp-1">{inc.title}</h5>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{inc.location}</p>
                    </div>
                  </button>
                );
              })}
        </div>
      </div>
    </div>
  );
};
