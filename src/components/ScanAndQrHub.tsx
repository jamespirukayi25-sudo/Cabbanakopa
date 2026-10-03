import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import jsQR from "jsqr";
import {
  QrCode,
  ScanLine,
  Camera,
  Printer,
  Download,
  Share2,
  Copy,
  Check,
  Car,
  Bus,
  MapPin,
  ShieldAlert,
  Phone,
  ExternalLink,
  Upload,
  X,
  RefreshCw,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react";
import { QrStickerConfig, QrStickerType } from "../types";
import { KOMBI_RANKS, POPULAR_LOCATIONS } from "../data/harareData";

interface ScanAndQrHubProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string, subParam?: string) => void;
  currentStopName?: string;
  currentVehicleId?: string;
}

export const ScanAndQrHub: React.FC<ScanAndQrHubProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  currentStopName = "Copacabana Central Terminal",
  currentVehicleId = "Kombi Fleet #24 (AEB 4920)",
}) => {
  // Mode: "generate" (Create/Print stickers for cars & bus stops) VS "scan" (In-app camera scanner)
  const [activeMode, setActiveMode] = useState<"generate" | "scan">("generate");

  // Sticker Template Type
  const [stickerType, setStickerType] = useState<QrStickerType>("car_windscreen");

  // App Base URL for the QR code
  const getAppBaseUrl = () => {
    if (typeof window !== "undefined" && window.location?.origin) {
      return window.location.origin;
    }
    return "https://ais-pre-ipordghiavlxdmjk2qitp2-329749853686.europe-west2.run.app";
  };

  // Sticker Configuration State
  const [config, setConfig] = useState<QrStickerConfig>({
    type: "car_windscreen",
    title: "COPPAKABANA TRAFFIC & TRANSPORT",
    subtitle: "Scan to check Live Harare Traffic, Potholes & Kombi Ranks",
    locationName: currentStopName,
    routeCorridor: "Copacabana ⇄ Chitungwiza (Seke Rd)",
    vehicleReg: currentVehicleId,
    driverName: "Tinashe 'Speedy' Moyo",
    targetUrl: getAppBaseUrl(),
    includeHelpline: true,
    shonaSubtitle: "Skenai ne camera ye phone kuti muone traffic ne kombi!",
    themeColor: "amber",
  });

  // Generated QR Data URL & SVG
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Scanner States
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const stickerRef = useRef<HTMLDivElement | null>(null);

  // Preset Template Update
  const applyPreset = (type: QrStickerType) => {
    setStickerType(type);
    const baseUrl = getAppBaseUrl();

    switch (type) {
      case "car_windscreen":
        setConfig((prev) => ({
          ...prev,
          type: "car_windscreen",
          title: "COPPAKABANA PASSENGER TRANSIT",
          subtitle: "Scan with Phone Camera for Live Traffic & Road Hazards",
          routeCorridor: prev.routeCorridor || "Copacabana ⇄ Chitungwiza",
          vehicleReg: prev.vehicleReg || "Kombi Fleet #24 (AEB 4920)",
          targetUrl: `${baseUrl}?view=car&vehicle=${encodeURIComponent(prev.vehicleReg || "AEB-4920")}`,
          shonaSubtitle: "Skenai muone traffic jam, potholes nemapurisa pamberi!",
          themeColor: "amber",
          includeHelpline: true,
        }));
        break;

      case "kombi_headrest":
        setConfig((prev) => ({
          ...prev,
          type: "kombi_headrest",
          title: "COMMUTER LIVE ASSISTANT",
          subtitle: "Scan While Riding: Check Arrival ETA, Fares & Report Jams",
          routeCorridor: prev.routeCorridor || "Market Square ⇄ Kuwadzana",
          vehicleReg: prev.vehicleReg || "Toyota HiAce (AFG 8812)",
          targetUrl: `${baseUrl}?tab=community`,
          shonaSubtitle: "Bhadharai fare, onai traffic, kana kumhan'ara emergency!",
          themeColor: "amber",
          includeHelpline: true,
        }));
        break;

      case "bus_stop_sign":
        setConfig((prev) => ({
          ...prev,
          type: "bus_stop_sign",
          title: "HARARE COMMUTER BUS STOP",
          subtitle: "Official Live Transit Hub • Scan for Kombis, Delays & Fares",
          locationName: prev.locationName || "Copacabana Central Terminal",
          routeCorridor: "Harare CBD Central Hub",
          targetUrl: `${baseUrl}?tab=kombi&stop=${encodeURIComponent(prev.locationName || "Copacabana")}`,
          shonaSubtitle: "Skenai muone kombi dziri kuuya ne traffic ye Harare yose!",
          themeColor: "amber",
          includeHelpline: true,
        }));
        break;

      case "kombi_rank_poster":
        setConfig((prev) => ({
          ...prev,
          type: "kombi_rank_poster",
          title: "COPACABANA / HARARE OMNIBUS BOARD",
          subtitle: "Live Rank Arrivals, Route Queues, Marshal Rescue & Weather",
          locationName: "Market Square / Copacabana Terminal",
          targetUrl: `${baseUrl}?tab=kombi`,
          shonaSubtitle: "Kombi dzese, mareti e fare, uye ma traffic controller aripo!",
          themeColor: "emerald",
          includeHelpline: true,
        }));
        break;

      case "driver_badge":
        setConfig((prev) => ({
          ...prev,
          type: "driver_badge",
          title: "VERIFIED HARARE TRANSIT DRIVER",
          subtitle: "Scan to View Safety Rating, Direct EcoCash & Vehicle Info",
          driverName: "Tinashe 'Speedy' Moyo",
          vehicleReg: "Toyota HiAce (AEB 4920)",
          targetUrl: `${baseUrl}?tab=rides`,
          shonaSubtitle: "Mutyairi akanyoreswa zviri pamutemo • Safe & Reliable",
          themeColor: "blue",
          includeHelpline: false,
        }));
        break;
    }
  };

  // Generate QR code whenever targetUrl or options change
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setIsGenerating(true);

    const generateQr = async () => {
      try {
        const url = config.targetUrl || getAppBaseUrl();
        const dataUrl = await QRCode.toDataURL(url, {
          width: 512,
          margin: 1.5,
          color: {
            dark: "#020617", // slate-950
            light: "#ffffff",
          },
          errorCorrectionLevel: "H", // High redundancy for outdoor / car scanning
        });
        if (isMounted) {
          setQrDataUrl(dataUrl);
          setIsGenerating(false);
        }
      } catch (err) {
        console.error("Error generating QR code:", err);
        if (isMounted) setIsGenerating(false);
      }
    };

    generateQr();

    return () => {
      isMounted = false;
    };
  }, [config.targetUrl, config.type, isOpen]);

  // Clean up camera on unmount or tab switch
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (activeMode !== "scan") {
      stopCamera();
    } else {
      startCamera();
    }
  }, [activeMode]);

  // Start Camera Stream for QR Scanner
  const startCamera = async () => {
    setCameraError(null);
    setHasScanned(false);
    setScanResult(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera is not supported on this browser or connection.");
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setCameraActive(true);

        // Check torch support
        const track = stream.getVideoTracks()[0];
        const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
        if (capabilities.torch) {
          setTorchSupported(true);
        }

        // Start scanning loop
        startScanLoop();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access in browser settings or upload a photo of the code."
          : `Unable to access camera: ${err.message || "Unknown error"}`
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchEnabled(false);
  };

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const newTorchState = !torchEnabled;
      await (track.applyConstraints as any)({
        advanced: [{ torch: newTorchState }],
      });
      setTorchEnabled(newTorchState);
    } catch (err) {
      console.warn("Torch toggle failed:", err);
    }
  };

  // Continuous QR scan loop
  const startScanLoop = () => {
    const scanFrame = () => {
      if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
        animFrameId.current = requestAnimationFrame(scanFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          handleDetectedQr(code.data);
          return;
        }
      }

      animFrameId.current = requestAnimationFrame(scanFrame);
    };

    animFrameId.current = requestAnimationFrame(scanFrame);
  };

  // Handle detected QR Code string
  const handleDetectedQr = (data: string) => {
    if (hasScanned) return;
    setHasScanned(true);
    setScanResult(data);
    playScanBeep();

    // Pause camera scanning temporarily
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
  };

  // Handle Image File Upload for QR Scanning
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);
        if (code && code.data) {
          handleDetectedQr(code.data);
        } else {
          alert("No clear QR code found in this photo. Please ensure good lighting or try another angle.");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Soft sound feedback on scan
  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch {
      // AudioContext unavailable or blocked, silent fallback
    }
  };

  // Print Sticker/Signboard
  const handlePrint = () => {
    window.print();
  };

  // Download High-Resolution Sticker PNG
  const handleDownloadPng = async () => {
    if (!qrDataUrl) return;

    // Create an offscreen canvas to render a high-res sticker
    const canvas = document.createElement("canvas");
    const width = 1200;
    const height = 1500;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#0f172a"; // slate-900
    ctx.fillRect(0, 0, width, height);

    // Outer Border (Yellow warning / municipal border)
    ctx.lineWidth = 16;
    ctx.strokeStyle = "#f59e0b"; // amber-500
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Header Banner
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(28, 28, width - 56, 170);

    // Header Text
    ctx.fillStyle = "#020617";
    ctx.font = "bold 44px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("COPPAKABANA TRAFFIC & TRANSPORT", width / 2, 95);

    ctx.font = "bold 30px sans-serif";
    ctx.fillText(config.type === "bus_stop_sign" ? "HARARE BUS STOP COMMUTER BOARD" : "VEHICLE & PASSENGER SCANNER", width / 2, 148);

    // Title / Location
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 46px sans-serif";
    ctx.fillText(config.locationName || config.routeCorridor || "Harare Transit Network", width / 2, 260);

    // Subtitle
    ctx.fillStyle = "#94a3b8";
    ctx.font = "28px sans-serif";
    ctx.fillText(config.subtitle, width / 2, 310);

    // Draw QR Code in Center
    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => {
      const qrSize = 650;
      const qrX = (width - qrSize) / 2;
      const qrY = 360;

      // White QR container card
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 24);
      ctx.fill();

      // Draw QR Image
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Shona Instructions
      ctx.fillStyle = "#fef08a"; // yellow-200
      ctx.font = "bold 32px sans-serif";
      ctx.fillText(`"${config.shonaSubtitle}"`, width / 2, 1100);

      // Car Details or Corridor
      ctx.fillStyle = "#38bdf8"; // sky-400
      ctx.font = "bold 32px sans-serif";
      if (config.vehicleReg) {
        ctx.fillText(`Reg: ${config.vehicleReg}  •  Route: ${config.routeCorridor}`, width / 2, 1170);
      } else {
        ctx.fillText(`Harare Corridor: ${config.routeCorridor}`, width / 2, 1170);
      }

      // Emergency Helplines
      if (config.includeHelpline) {
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(80, 1240, width - 160, 100);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 26px sans-serif";
        ctx.fillText("HARARE EMERGENCY HOTLINES", width / 2, 1278);
        ctx.font = "22px sans-serif";
        ctx.fillText("ZRP Traffic: +263 242 777777 / 999  •  Ambulance: +263 772 235 678  •  Rescue Marshalls", width / 2, 1315);
      }

      // App URL Footer
      ctx.fillStyle = "#64748b";
      ctx.font = "22px monospace";
      ctx.fillText(config.targetUrl, width / 2, 1420);

      // Trigger Download
      const link = document.createElement("a");
      link.download = `coppakabana-${config.type}-sticker.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    qrImg.src = qrDataUrl;
  };

  // Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(config.targetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  // Share Link via Web Share API
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Coppakabana Traffic & Transport",
          text: `Scan or open to view live Harare traffic, bus stop updates, and kombi fares: ${config.targetUrl}`,
          url: config.targetUrl,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  // Process scanned result and navigate within the app
  const handleActionOnScan = () => {
    if (!scanResult) return;

    try {
      const url = new URL(scanResult);
      const tabParam = url.searchParams.get("tab") || url.searchParams.get("view");
      const stopParam = url.searchParams.get("stop");

      if (tabParam && onNavigateToTab) {
        onNavigateToTab(tabParam, stopParam || undefined);
        onClose();
        return;
      }
    } catch {
      // Plain text or external URL
    }

    if (scanResult.startsWith("http")) {
      window.open(scanResult, "_blank");
    } else {
      alert(`Scanned content: ${scanResult}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Hidden Print Styling that only outputs the sticker/sign */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-qr-sticker, #printable-qr-sticker * {
            visibility: visible !important;
          }
          #printable-qr-sticker {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: 8px solid #000 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .print\\:text-black {
            color: black !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:border-black {
            border-color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  Harare Transit QR & Scanning Hub
                </h2>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Car Stickers & Bus Stop Signs
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate printable stickers for cars, kombis & bus stops, or scan codes live in the app.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setActiveMode("generate")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeMode === "generate"
                    ? "bg-amber-500 text-slate-950 shadow-md font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print & Create Codes</span>
              </button>

              <button
                onClick={() => setActiveMode("scan")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeMode === "scan"
                    ? "bg-amber-500 text-slate-950 shadow-md font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ScanLine className="w-3.5 h-3.5" />
                <span>Scan with Camera</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeMode === "generate" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Template Selection & Controls (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                    <Sliders className="w-3.5 h-3.5" /> Select Placement & Template
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => applyPreset("car_windscreen")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                        stickerType === "car_windscreen"
                          ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500"
                          : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Car className="w-4 h-4 text-amber-400" />
                        <span>Car Windscreen Decal</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Weather-resistant dashboard & glass sticker
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPreset("kombi_headrest")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                        stickerType === "kombi_headrest"
                          ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500"
                          : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Bus className="w-4 h-4 text-emerald-400" />
                        <span>Kombi Seatback Card</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Passengers scan from their seat while riding
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPreset("bus_stop_sign")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                        stickerType === "bus_stop_sign"
                          ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500"
                          : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span>Bus Stop Signboard</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Outdoor metal post or shelter signboard
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPreset("kombi_rank_poster")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                        stickerType === "kombi_rank_poster"
                          ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500"
                          : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <ShieldAlert className="w-4 h-4 text-orange-400" />
                        <span>Rank Marshal Poster</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        A4/A3 station poster for Copacabana ranks
                      </span>
                    </button>
                  </div>
                </div>

                {/* Customization Inputs */}
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Sticker & Sign Details</span>
                    <span className="text-[10px] text-amber-400">Editable for your vehicle or stop</span>
                  </div>

                  {/* Location or Bus Stop Name */}
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      {stickerType === "bus_stop_sign" || stickerType === "kombi_rank_poster"
                        ? "Bus Stop / Rank Name:"
                        : "Location or Operating Hub:"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={config.locationName}
                        onChange={(e) => setConfig({ ...config, locationName: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        placeholder="e.g. Copacabana Central Terminal"
                      />
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setConfig({
                              ...config,
                              locationName: e.target.value,
                              targetUrl: `${getAppBaseUrl()}?tab=kombi&stop=${encodeURIComponent(e.target.value)}`,
                            });
                          }
                        }}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 cursor-pointer"
                        title="Pick Harare Rank"
                      >
                        <option value="">Choose Rank...</option>
                        {KOMBI_RANKS.map((rank) => (
                          <option key={rank.id} value={rank.name}>
                            {rank.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Vehicle Reg or Fleet ID (for cars) */}
                  {(stickerType === "car_windscreen" || stickerType === "kombi_headrest" || stickerType === "driver_badge") && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Vehicle / Reg #:</label>
                        <input
                          type="text"
                          value={config.vehicleReg || ""}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              vehicleReg: e.target.value,
                              targetUrl: `${getAppBaseUrl()}?vehicle=${encodeURIComponent(e.target.value)}`,
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          placeholder="e.g. AEB 4920"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Driver / Marshal:</label>
                        <input
                          type="text"
                          value={config.driverName || ""}
                          onChange={(e) => setConfig({ ...config, driverName: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          placeholder="e.g. Tinashe Moyo"
                        />
                      </div>
                    </div>
                  )}

                  {/* Route Corridor */}
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Route Corridor:</label>
                    <input
                      type="text"
                      value={config.routeCorridor || ""}
                      onChange={(e) => setConfig({ ...config, routeCorridor: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      placeholder="e.g. Copacabana ⇄ Chitungwiza (Seke Rd)"
                    />
                  </div>

                  {/* Target Web URL */}
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                      <span>Target App URL Encoded in QR:</span>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="text-amber-400 hover:text-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedLink ? "Copied!" : "Copy Link"}
                      </button>
                    </label>
                    <input
                      type="text"
                      value={config.targetUrl}
                      onChange={(e) => setConfig({ ...config, targetUrl: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Toggle Hotline Banner */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="text-[11px] text-slate-300 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.includeHelpline}
                        onChange={(e) => setConfig({ ...config, includeHelpline: e.target.checked })}
                        className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <span>Include Harare Emergency Hotline numbers</span>
                    </label>
                  </div>
                </div>

                {/* Quick Print & Export Actions */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    onClick={handlePrint}
                    className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Sticker / Sign</span>
                  </button>

                  <button
                    onClick={handleDownloadPng}
                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition border border-slate-700 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download High-Res PNG</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition border border-slate-700 cursor-pointer"
                    title="Share Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Live Printable Preview (7 cols) */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Live Print Preview (Ready for Windscreen, Dashboard or Bus Stop Post)
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    High Redundancy QR (Scan from 3 meters)
                  </span>
                </div>

                {/* THE PRINTABLE STICKER / SIGN CONTAINER */}
                <div
                  id="printable-qr-sticker"
                  ref={stickerRef}
                  className="w-full max-w-md bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-4 border-amber-500 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col items-center text-center print:border-8 print:border-black print:bg-white print:text-black print:p-8"
                >
                  {/* Decorative Corner Screws/Rivets for Sign Aesthetic */}
                  <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full border border-amber-500/40 bg-slate-800 print:hidden" />
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border border-amber-500/40 bg-slate-800 print:hidden" />
                  <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full border border-amber-500/40 bg-slate-800 print:hidden" />
                  <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full border border-amber-500/40 bg-slate-800 print:hidden" />

                  {/* Header Banner */}
                  <div className="w-full bg-amber-500 text-slate-950 font-black py-1.5 px-3 rounded-lg mb-3 uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 print:bg-black print:text-white">
                    {stickerType === "bus_stop_sign" ? (
                      <MapPin className="w-4 h-4 text-slate-950 print:text-white" />
                    ) : (
                      <Car className="w-4 h-4 text-slate-950 print:text-white" />
                    )}
                    <span>{config.title}</span>
                  </div>

                  {/* Location & Route Heading */}
                  <h3 className="text-lg sm:text-xl font-black text-white print:text-black leading-tight mb-1">
                    {config.locationName || config.routeCorridor}
                  </h3>

                  <p className="text-[11px] sm:text-xs text-slate-300 print:text-slate-700 max-w-xs mb-3 font-medium">
                    {config.subtitle}
                  </p>

                  {/* QR CODE CARD */}
                  <div className="relative p-3 bg-white rounded-xl shadow-lg border-2 border-slate-300 print:border-4 print:border-black my-1">
                    {isGenerating ? (
                      <div className="w-48 h-48 flex items-center justify-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                      </div>
                    ) : qrDataUrl ? (
                      <div className="relative">
                        <img
                          src={qrDataUrl}
                          alt="Harare Transit QR Code"
                          className="w-48 h-48 sm:w-56 sm:h-56 object-contain block"
                        />
                        {/* Center App Badge */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-amber-500 text-slate-950 p-1 rounded-md shadow-md border-2 border-white flex items-center gap-1 font-black text-[9px] print:bg-black print:text-white">
                            <Car className="w-3 h-3" />
                            <span>COPPAKABANA</span>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Bilingual Instruction (Shona & English) */}
                  <div className="mt-3 text-amber-300 print:text-black font-bold text-xs sm:text-sm">
                    "{config.shonaSubtitle}"
                  </div>

                  {/* Vehicle or Corridor Details */}
                  {config.vehicleReg && (
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-sky-400 print:text-black font-mono font-bold bg-slate-950/80 print:bg-transparent px-3 py-1 rounded-md border border-slate-800 print:border-none">
                      <span>Reg: {config.vehicleReg}</span>
                      <span>•</span>
                      <span>{config.routeCorridor}</span>
                    </div>
                  )}

                  {/* Emergency Helpline Strip */}
                  {config.includeHelpline && (
                    <div className="w-full mt-3 pt-2.5 border-t border-slate-800 print:border-black flex flex-col gap-0.5 text-[10px] text-slate-400 print:text-slate-800">
                      <div className="flex items-center justify-center gap-1 text-red-400 print:text-black font-bold">
                        <Phone className="w-3 h-3" />
                        <span>HARARE EMERGENCY HOTLINES:</span>
                      </div>
                      <div>ZRP Traffic: +263 242 777777 / 999 • Ambulance: +263 772 235 678</div>
                      <div>Traffic Controller Rescue Marshalls on Coppakabana App</div>
                    </div>
                  )}

                  {/* Footer App URL */}
                  <div className="mt-2 text-[9px] text-slate-500 print:text-slate-600 font-mono truncate max-w-full">
                    Scan with any smartphone camera • Powered by Coppakabana Traffic
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-400 text-center max-w-md">
                  💡 <strong>Tip for Kombi & Fleet Owners:</strong> Print on glossy adhesive sticker paper or laminate for dashboard windscreens, seat headrests, and rank terminal signboards.
                </div>
              </div>
            </div>
          ) : (
            /* SCANNER MODE: In-App Live Camera QR Scanner */
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center justify-center gap-2">
                  <Camera className="w-5 h-5 text-amber-400" />
                  <span>Scan Car Sticker or Bus Stop Sign</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Point your camera at any Coppakabana QR code inside a kombi, car windscreen, or bus stop poster.
                </p>
              </div>

              {/* Camera Viewfinder Box */}
              <div className="relative w-full aspect-video sm:aspect-[4/3] max-h-[380px] bg-black rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Viewfinder Target Reticle */}
                {cameraActive && !scanResult && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-amber-400/80 rounded-2xl">
                      {/* Corner Accents */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400" />

                      {/* Animated Laser Scanning Line */}
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#f59e0b] animate-bounce" />
                    </div>
                  </div>
                )}

                {/* Controls overlay (Torch) */}
                {cameraActive && (
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    {torchSupported && (
                      <button
                        type="button"
                        onClick={toggleTorch}
                        className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg ${
                          torchEnabled ? "bg-amber-400 text-slate-950" : "bg-black/60 text-white border border-white/20"
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{torchEnabled ? "Flash ON" : "Torch"}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Camera Inactive / Permission Error State */}
                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <AlertTriangle className="w-10 h-10 text-amber-400" />
                    <div className="text-sm font-bold text-white max-w-sm">
                      {cameraError}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={startCamera}
                        className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer hover:bg-amber-400"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Try Again
                      </button>
                    </div>
                  </div>
                )}

                {/* Success Result Overlay */}
                {scanResult && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>

                    <div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Coppakabana Transit Code Scanned!
                      </span>
                      <div className="text-sm font-mono text-white bg-slate-900 border border-slate-800 p-2.5 rounded-xl max-w-md break-all mt-1">
                        {scanResult}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleActionOnScan}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20 cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open Details in App</span>
                      </button>

                      <button
                        onClick={() => {
                          setScanResult(null);
                          setHasScanned(false);
                          startScanLoop();
                        }}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Scan Another Code</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Photo Alternative */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Have a photo or screenshot of a sticker or bus stop sign?</span>
                </div>

                <label className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition border border-slate-700 cursor-pointer flex items-center gap-1.5 shrink-0">
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Choose Photo to Scan</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Instructions Callout */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-slate-300">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>How to use in Harare:</strong> Commuters on kombis can scan headrest stickers to verify kombi fares and report roadblocks. At bus stops (Copacabana, Market Square, Fourth St), scan the station sign to view live kombi arrival times and real-time congestion!
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Coppakabana Transit Scanning System • Ready for Harare Vehicles & Stops</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
