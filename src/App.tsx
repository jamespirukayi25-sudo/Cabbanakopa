import React, { useState, useEffect } from "react";
import {
  MapPin,
  AlertTriangle,
  Video,
  Car,
  Bus,
  Lightbulb,
  Shield,
  Clock,
  Sparkles,
  Search,
  Filter,
  Layers,
  PhoneCall,
  RefreshCw,
  CreditCard,
  CheckCircle2,
  Lock,
  Star,
  Users,
  Eye,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingDown,
  Info,
  ShieldAlert,
  QrCode,
  ScanLine,
  Compass,
  Building2,
  LayoutGrid,
  Calculator,
  Gauge,
  PackageSearch,
  Briefcase,
  UserCheck
} from "lucide-react";
import {
  Incident,
  CameraFeed,
  Ride,
  KombiPost,
  CommunityIdea,
  AlternateRoutePlan,
  PaymentTransaction,
  DriverCommunityPost,
  TrafficController,
  TrafficControllerRequest,
  ControllerDispatchStatus,
  MarketplaceItem,
  MarketplaceStatus,
  ActiveFleetSubscription
} from "./types";
import { HarareLeafletMap } from "./components/HarareLeafletMap";
import { IncidentFeed } from "./components/IncidentFeed";
import { LiveCameraViewer } from "./components/LiveCameraViewer";
import { RideNetwork } from "./components/RideNetwork";
import { KombiBoard } from "./components/KombiBoard";
import { KombiFareCalculator } from "./components/KombiFareCalculator";
import { KombiDriverShiftTracker } from "./components/KombiDriverShiftTracker";
import { KombiLostProperty } from "./components/KombiLostProperty";
import { TrafficPreventionForum } from "./components/TrafficPreventionForum";
import { DriverCommunityHub } from "./components/DriverCommunityHub";
import { TrafficControllersHub } from "./components/TrafficControllersHub";
import { TrafficControllerDispatchModal } from "./components/TrafficControllerDispatchModal";
import { PaymentModal } from "./components/PaymentModal";
import { AlternateRouteModal } from "./components/AlternateRouteModal";
import { ScanAndQrHub } from "./components/ScanAndQrHub";
import { FleetPricingTable } from "./components/FleetPricingTable";
import { FleetTrialExpiryBanner } from "./components/FleetTrialExpiryBanner";
import { AppStructureModal } from "./components/AppStructureModal";
import { KOMBI_RANKS, POPULAR_LOCATIONS } from "./data/harareData";
import { ShoppingBag } from "lucide-react";

export default function App() {
  // Navigation tabs & 4 Big Topics Formation on Bottom Dock
  const [activeTab, setActiveTab] = useState<
    "map" | "community" | "controllers" | "rides" | "kombi" | "cameras" | "forum" | "payments" | "qr" | "fare_calc" | "shift_tracker" | "lost_found"
  >("kombi");
  const [activeTopic, setActiveTopic] = useState<"ranks" | "driver_intel" | "commuter" | "fleet">("ranks");
  const [transportRole, setTransportRole] = useState<"driver_conductor" | "passenger" | "operator">("driver_conductor");
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [communitySubTab, setCommunitySubTab] = useState<"intel" | "marketplace">("intel");
  const [paymentSubTab, setPaymentSubTab] = useState<"fleet_pricing" | "escrow_vault">("fleet_pricing");
  const [activeFleetSubscription, setActiveFleetSubscription] = useState<ActiveFleetSubscription | null>(() => {
    try {
      const saved = localStorage.getItem("harare_fleet_subscription");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default seed so that fleet owners immediately experience the 1-Day Free Trial expiry notification banner
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 18 * 60 * 1000 + 42 * 60 * 1000).toISOString();
    const initialTrial: ActiveFleetSubscription = {
      planId: "trial_1day",
      planName: "1-Day Free Trial",
      status: "trial_active",
      activatedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      expiresAt: expiresAt,
      vehicleReg: "AEB 4920",
      ownerName: "Farai Munemo (Fleet Owner)",
      ownerPhone: "+263 77 312 8904",
      paymentMethod: "EcoCash",
      autoRenew: false
    };
    try {
      localStorage.setItem("harare_fleet_subscription", JSON.stringify(initialTrial));
    } catch {
      // ignore
    }
    return initialTrial;
  });

  const handleExtendDemoHours = (hours: number) => {
    if (!activeFleetSubscription) return;
    const newExpiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    const updated: ActiveFleetSubscription = {
      ...activeFleetSubscription,
      expiresAt: newExpiresAt,
      status: hours <= 0 ? "expired" : "trial_active"
    };
    setActiveFleetSubscription(updated);
    try {
      localStorage.setItem("harare_fleet_subscription", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Synchronize activeTopic whenever activeTab or communitySubTab changes
  useEffect(() => {
    if (activeTab === "kombi" || activeTab === "fare_calc" || activeTab === "cameras" || activeTab === "map") {
      setActiveTopic("ranks");
    } else if (activeTab === "community" || activeTab === "controllers" || activeTab === "forum" || activeTab === "shift_tracker") {
      if (activeTab === "community" && communitySubTab === "marketplace") {
        setActiveTopic("fleet");
      } else {
        setActiveTopic("driver_intel");
      }
    } else if (activeTab === "rides" || activeTab === "lost_found") {
      setActiveTopic("commuter");
    } else if (activeTab === "payments" || activeTab === "qr") {
      setActiveTopic("fleet");
    }
  }, [activeTab, communitySubTab]);

  const handleSelectTopic = (topic: "ranks" | "driver_intel" | "commuter" | "fleet") => {
    setActiveTopic(topic);
    if (topic === "ranks") {
      if (!["kombi", "fare_calc", "cameras", "map"].includes(activeTab)) {
        setActiveTab("kombi");
      }
    } else if (topic === "driver_intel") {
      if (!["community", "shift_tracker", "controllers", "forum"].includes(activeTab)) {
        setActiveTab("community");
        setCommunitySubTab("intel");
      }
    } else if (topic === "commuter") {
      if (!["rides", "lost_found", "fare_calc"].includes(activeTab)) {
        setActiveTab("rides");
      }
    } else if (topic === "fleet") {
      if (!["payments", "qr"].includes(activeTab)) {
        setActiveTab("payments");
        setPaymentSubTab("fleet_pricing");
      }
    }
  };

  const handleSelectPage = (
    topic: "ranks" | "driver_intel" | "commuter" | "fleet",
    page: string
  ) => {
    setActiveTopic(topic);
    if (page === "map") {
      setActiveTab("map");
    } else if (page === "kombi") {
      setActiveTab("kombi");
    } else if (page === "fare_calc") {
      setActiveTab("fare_calc");
    } else if (page === "cameras") {
      setActiveTab("cameras");
    } else if (page === "rides") {
      setActiveTab("rides");
    } else if (page === "lost_found") {
      setActiveTab("lost_found");
    } else if (page === "shift_tracker") {
      setActiveTab("shift_tracker");
    } else if (page === "intel") {
      setActiveTab("community");
      setCommunitySubTab("intel");
    } else if (page === "routes") {
      setActiveTab("map");
    } else if (page === "controllers") {
      setActiveTab("controllers");
    } else if (page === "forum") {
      setActiveTab("forum");
    } else if (page === "marketplace" || page === "spares") {
      setActiveTab("community");
      setCommunitySubTab("marketplace");
    } else if (page === "jobs") {
      setActiveTab("kombi");
    } else if (page === "fleet_pricing") {
      setActiveTab("payments");
      setPaymentSubTab("fleet_pricing");
    } else if (page === "escrow_vault" || page === "payments") {
      setActiveTab("payments");
      setPaymentSubTab("escrow_vault");
    } else if (page === "qr") {
      setShowQrHub(true);
    }
  };

  // QR Hub & Signage States
  const [showQrHub, setShowQrHub] = useState(false);
  const [qrHubInitialStop, setQrHubInitialStop] = useState<string>("Copacabana Central Terminal");
  const [qrHubInitialVehicle, setQrHubInitialVehicle] = useState<string>("Kombi Fleet #24 (AEB 4920)");

  // Core Data States
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [cameras, setCameras] = useState<CameraFeed[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [kombiPosts, setKombiPosts] = useState<KombiPost[]>([]);
  const [communityIdeas, setCommunityIdeas] = useState<CommunityIdea[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>([]);
  const [driverCommunityPosts, setDriverCommunityPosts] = useState<DriverCommunityPost[]>([]);
  const [trafficControllers, setTrafficControllers] = useState<TrafficController[]>([]);
  const [trafficRequests, setTrafficRequests] = useState<TrafficControllerRequest[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);

  // Selection & Modal States
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<CameraFeed | null>(null);
  const [selectedRideForPayment, setSelectedRideForPayment] = useState<Ride | null>(null);
  const [activeRoutePlan, setActiveRoutePlan] = useState<AlternateRoutePlan | null>(null);
  const [showAiAdvisor, setShowAiAdvisor] = useState(false);
  const [showControllerModal, setShowControllerModal] = useState(false);
  const [controllerModalPrefill, setControllerModalPrefill] = useState<{
    location?: string;
    corridor?: string;
    coords?: [number, number];
  }>({});

  // Map layer controls
  const [showRanks, setShowRanks] = useState(true);
  const [showCameras, setShowCameras] = useState(true);
  const [showRides, setShowRides] = useState(true);
  const [showControllersOnMap, setShowControllersOnMap] = useState(true);
  const [filterType, setFilterType] = useState("all");

  // AI Advisor form states
  const [aiOrigin, setAiOrigin] = useState("Harare CBD (Copacabana)");
  const [aiDestination, setAiDestination] = useState("Chitungwiza (Makoni)");
  const [aiQuery, setAiQuery] = useState("Fastest detour to avoid Seke Road flyover congestion and robots down");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  // Initial Data Fetch & URL Deep Link Check
  useEffect(() => {
    fetchInitialData();

    try {
      if (typeof window !== "undefined" && window.location) {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get("tab") || params.get("view");
        const actionParam = params.get("action");
        const stopParam = params.get("stop");
        const vehicleParam = params.get("vehicle");

        if (actionParam === "scan" || tabParam === "qr") {
          setShowQrHub(true);
        }
        if (stopParam) {
          setQrHubInitialStop(stopParam);
        }
        if (vehicleParam) {
          setQrHubInitialVehicle(vehicleParam);
        }
        if (tabParam && ["map", "community", "controllers", "rides", "kombi", "cameras", "forum", "payments", "qr"].includes(tabParam)) {
          setActiveTab(tabParam as any);
        }
      }
    } catch {
      // ignore param parsing error
    }
  }, []);

  const fetchInitialData = async () => {
    try {
      const [incRes, camRes, rideRes, kbRes, ideasRes, payRes, dcpRes, tcRes, reqRes, mktRes] = await Promise.all([
        fetch("/api/incidents"),
        fetch("/api/cameras"),
        fetch("/api/rides"),
        fetch("/api/kombi-board"),
        fetch("/api/community-ideas"),
        fetch("/api/payments/history").catch(() => null),
        fetch("/api/driver-community").catch(() => null),
        fetch("/api/traffic-controllers").catch(() => null),
        fetch("/api/traffic-controllers/requests").catch(() => null),
        fetch("/api/marketplace").catch(() => null),
      ]);

      if (incRes.ok) setIncidents(await incRes.json());
      if (camRes.ok) setCameras(await camRes.json());
      if (rideRes.ok) setRides(await rideRes.json());
      if (kbRes.ok) setKombiPosts(await kbRes.json());
      if (ideasRes.ok) setCommunityIdeas(await ideasRes.json());
      if (payRes && payRes.ok) setPaymentHistory(await payRes.json());
      if (dcpRes && dcpRes.ok) setDriverCommunityPosts(await dcpRes.json());
      if (tcRes && tcRes.ok) setTrafficControllers(await tcRes.json());
      if (reqRes && reqRes.ok) setTrafficRequests(await reqRes.json());
      if (mktRes && mktRes.ok) setMarketplaceItems(await mktRes.json());
    } catch (err) {
      console.error("Error loading Harare traffic data:", err);
    }
  };

  // Validate incident handler (Consensus verification)
  const handleValidateIncident = async (id: string) => {
    try {
      const res = await fetch(`/api/incidents/${id}/validate`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIncidents((prev) =>
          prev.map((inc) =>
            inc.id === id
              ? {
                  ...inc,
                  upvotes: data.upvotes,
                  refutations: data.refutations,
                  verificationStatus: data.verificationStatus,
                }
              : inc
          )
        );
      }
    } catch (err) {
      console.error("Error validating incident:", err);
    }
  };

  // Refute incident handler (Report cleared or incorrect)
  const handleRefuteIncident = async (id: string) => {
    try {
      const res = await fetch(`/api/incidents/${id}/refute`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIncidents((prev) =>
          prev.map((inc) =>
            inc.id === id
              ? {
                  ...inc,
                  upvotes: data.upvotes,
                  refutations: data.refutations,
                  verificationStatus: data.verificationStatus,
                  status: data.status,
                }
              : inc
          )
        );
      }
    } catch (err) {
      console.error("Error refuting incident:", err);
    }
  };

  // Upvote incident handler
  const handleUpvoteIncident = async (id: string) => {
    handleValidateIncident(id);
  };

  // Report new incident
  const handleReportIncident = async (newInc: Partial<Incident>) => {
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInc),
      });
      if (res.ok) {
        const created = await res.json();
        setIncidents((prev) => [created, ...prev]);
        setSelectedIncident(created);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Post ride
  const handlePostRide = async (newRide: Partial<Ride>) => {
    try {
      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRide),
      });
      if (res.ok) {
        const created = await res.json();
        setRides((prev) => [created, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Post Kombi job
  const handleAddKombiPost = async (newPost: Partial<KombiPost>) => {
    try {
      const res = await fetch("/api/kombi-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
      if (res.ok) {
        const created = await res.json();
        setKombiPosts((prev) => [created, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Community idea vote
  const handleVoteIdea = async (id: string, delta: number) => {
    try {
      const res = await fetch(`/api/community-ideas/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta }),
      });
      if (res.ok) {
        const data = await res.json();
        setCommunityIdeas((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, upvotes: data.upvotes, downvotes: data.downvotes } : i
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Community idea comment
  const handleAddComment = async (ideaId: string, author: string, text: string) => {
    try {
      const res = await fetch(`/api/community-ideas/${ideaId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, text }),
      });
      if (res.ok) {
        const comment = await res.json();
        setCommunityIdeas((prev) =>
          prev.map((i) =>
            i.id === ideaId
              ? { ...i, comments: [...i.comments, comment], commentsCount: i.commentsCount + 1 }
              : i
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Community idea new post
  const handleAddIdea = async (newIdea: Partial<CommunityIdea>) => {
    try {
      const res = await fetch("/api/community-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIdea),
      });
      if (res.ok) {
        const created = await res.json();
        setCommunityIdeas((prev) => [created, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Driver Community Handlers
  const handleAddDriverPost = async (newPost: Partial<DriverCommunityPost>) => {
    try {
      const res = await fetch("/api/driver-community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
      if (res.ok) {
        const created = await res.json();
        setDriverCommunityPosts((prev) => [created, ...prev]);
      }
    } catch (err) {
      console.error("Error creating driver community post:", err);
    }
  };

  const handleAcknowledgeDriverPost = async (id: string, driverName?: string, note?: string) => {
    try {
      const res = await fetch(`/api/driver-community/${id}/acknowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverName, note }),
      });
      if (res.ok) {
        const data = await res.json();
        setDriverCommunityPosts((prev) =>
          prev.map((p) => (p.id === id ? data.post : p))
        );
      }
    } catch (err) {
      console.error("Error acknowledging driver community post:", err);
    }
  };

  const handleVoteDriverPost = async (id: string, delta: number) => {
    try {
      const res = await fetch(`/api/driver-community/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta }),
      });
      if (res.ok) {
        const data = await res.json();
        setDriverCommunityPosts((prev) =>
          prev.map((p) => (p.id === id ? data.post : p))
        );
      }
    } catch (err) {
      console.error("Error voting on driver community post:", err);
    }
  };

  const handleReplyDriverPost = async (
    postId: string,
    reply: { author: string; role: any; text: string; badge?: string }
  ) => {
    try {
      const res = await fetch(`/api/driver-community/${postId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reply),
      });
      if (res.ok) {
        const data = await res.json();
        setDriverCommunityPosts((prev) =>
          prev.map((p) => (p.id === postId ? data.post : p))
        );
      }
    } catch (err) {
      console.error("Error replying to driver post:", err);
    }
  };

  // Community Marketplace Handlers
  const handleAddMarketplaceItem = async (newItem: Partial<MarketplaceItem>): Promise<MarketplaceItem> => {
    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        const data = await res.json();
        setMarketplaceItems((prev) => [data.item, ...prev]);
        return data.item;
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to list item on marketplace");
      }
    } catch (err) {
      console.error("Error creating marketplace item:", err);
      throw err;
    }
  };

  const handleLikeMarketplaceItem = async (id: string) => {
    try {
      const res = await fetch(`/api/marketplace/${id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setMarketplaceItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, likes: data.likes } : item))
        );
      }
    } catch (err) {
      console.error("Error liking item:", err);
    }
  };

  const handleUpdateMarketplaceStatus = async (id: string, status: MarketplaceStatus) => {
    try {
      const res = await fetch(`/api/marketplace/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMarketplaceItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
      }
    } catch (err) {
      console.error("Error updating item status:", err);
    }
  };

  // AI Route Advisor query
  const handleQueryAiAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/route-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: aiOrigin,
          destination: aiDestination,
          userQuestion: aiQuery,
        }),
      });
      const data = await res.json();
      setAiAdvice(data.advice);
    } catch (err) {
      console.error(err);
      setAiAdvice(
        "Harare Dispatch Advisory:\n• Take Herbert Chitepo Ave east to divert from Samora Machel bottlenecks.\n• Seke Road has heavy slow-and-go at Dieppe turnoff; divert through Airport Road or Sunningdale."
      );
    } finally {
      setAiLoading(false);
    }
  };

  // Traffic Controller Request Handlers
  const handleRequestController = async (requestData: Partial<TrafficControllerRequest>): Promise<TrafficControllerRequest | null> => {
    try {
      const res = await fetch("/api/traffic-controllers/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      if (res.ok) {
        const created: TrafficControllerRequest = await res.json();
        setTrafficRequests((prev) => [created, ...prev]);
        if (created.assignedController) {
          setTrafficControllers((prev) =>
            prev.map((tc) =>
              tc.id === created.assignedController?.id
                ? { ...tc, status: "dispatched", currentIntersection: created.location }
                : tc
            )
          );
        }
        return created;
      }
    } catch (err) {
      console.error("Error requesting traffic controller:", err);
    }
    return null;
  };

  const handleUpdateControllerRequestStatus = async (
    requestId: string,
    status: ControllerDispatchStatus,
    notes?: string
  ) => {
    try {
      const res = await fetch(`/api/traffic-controllers/requests/${requestId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        setTrafficRequests((prev) =>
          prev.map((r) =>
            r.id === requestId
              ? { ...r, status, dispatchOfficerNotes: notes || r.dispatchOfficerNotes }
              : r
          )
        );
        // refresh controllers
        const tcRes = await fetch("/api/traffic-controllers").catch(() => null);
        if (tcRes && tcRes.ok) setTrafficControllers(await tcRes.json());
      }
    } catch (err) {
      console.error("Error updating controller request status:", err);
    }
  };

  const handleRateController = async (requestId: string, rating: number, feedback: string) => {
    try {
      const res = await fetch(`/api/traffic-controllers/requests/${requestId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, feedback }),
      });
      if (res.ok) {
        setTrafficRequests((prev) =>
          prev.map((r) =>
            r.id === requestId ? { ...r, rating, clientFeedback: feedback } : r
          )
        );
      }
    } catch (err) {
      console.error("Error rating traffic controller:", err);
    }
  };

  const handleOpenControllerModalForIncident = (inc: Incident) => {
    setControllerModalPrefill({
      location: inc.location,
      corridor: inc.corridor || "Harare Metro",
      coords: inc.coords,
    });
    setShowControllerModal(true);
  };

  const handleOpenControllerModalAtCoords = (coords: [number, number], locationName?: string) => {
    setControllerModalPrefill({
      location: locationName || "Pinned Harare Location",
      corridor: "Harare Metro",
      coords,
    });
    setShowControllerModal(true);
  };

  // Handle successful escrow payment
  const handlePaymentSuccess = (transaction: PaymentTransaction) => {
    setPaymentHistory((prev) => [transaction, ...prev]);
    // update ride status
    setRides((prev) =>
      prev.map((r) =>
        r.id === transaction.rideId
          ? { ...r, status: "booked", paymentStatus: "escrow_held" }
          : r
      )
    );
  };

  // Handle completed ride with mutual rating
  const handleRideCompleted = (updatedRide: Ride) => {
    setRides((prev) => prev.map((r) => (r.id === updatedRide.id ? updatedRide : r)));
  };

  const incidentsWithVideo = incidents.filter((i) => i.hasVideo);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* ============================================================ */}
      {/* TOP HARARE PULSE HEADER & EMERGENCY BANNER                   */}
      {/* ============================================================ */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shrink-0 z-40 px-3 sm:px-4 py-2.5 space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Brand & City Context */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-slate-950 font-black text-lg">
                <Bus className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-none">
                    Coppakabana Kombi & Transit
                  </h1>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    HARARE LIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Omnibus Terminals • Driver Roadblock Intel • Conductor Fares & Change • Passenger Rides
                </p>
              </div>
            </div>

            {/* Weather / CAT Clock on Mobile */}
            <div className="flex md:hidden items-center gap-2 text-right">
              <span className="text-xs font-mono text-amber-400">
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} CAT
              </span>
            </div>
          </div>

          {/* Transport Role Switcher & Action Tools */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* 3-Way Role Selector */}
            <div className="flex items-center p-1 bg-slate-950/90 border border-slate-800 rounded-2xl shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setTransportRole("driver_conductor");
                  setActiveTopic("ranks");
                  setActiveTab("kombi");
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  transportRole === "driver_conductor"
                    ? "bg-amber-500 text-slate-950 shadow-md font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Bus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Driver & Conductor</span>
                <span className="sm:hidden">Driver</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTransportRole("passenger");
                  setActiveTopic("commuter");
                  setActiveTab("rides");
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  transportRole === "passenger"
                    ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Passenger (Commuter)</span>
                <span className="sm:hidden">Passenger</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTransportRole("operator");
                  setActiveTopic("fleet");
                  setActiveTab("payments");
                  setPaymentSubTab("fleet_pricing");
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  transportRole === "operator"
                    ? "bg-blue-600 text-white shadow-md font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fleet Operator</span>
                <span className="sm:hidden">Fleet</span>
              </button>
            </div>

            {/* Quick action buttons */}
            <button
              onClick={() => setShowStructureModal(true)}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer text-xs"
              title="View all 16 pages across the 4 bottom topics"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">All 16 Pages</span>
              <span className="lg:hidden">Pages</span>
            </button>

            <button
              onClick={() => setShowAiAdvisor(true)}
              className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Route Advisor</span>
            </button>

            {/* Emergency Hotline Button */}
            <div className="hidden xl:flex items-center gap-1.5 bg-rose-950/40 border border-rose-800/40 text-rose-300 px-2 py-1.5 rounded-xl text-[11px]">
              <PhoneCall className="w-3 h-3 text-rose-400" />
              <span>ZRP Traffic: <strong>+263 242 703631</strong></span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* ROLE-SPECIFIC CONTEXT BANNER & QUICK JUMPS                   */}
        {/* ============================================================ */}
        <div className="p-2 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {transportRole === "driver_conductor" && (
              <>
                <span className="text-amber-400 font-bold flex items-center gap-1.5 text-xs">
                  <Bus className="w-4 h-4" /> Driver/Conductor Active:
                </span>
                <span className="text-slate-300 hidden md:inline">
                  Copacabana & 4th St rank queues, roadblock alerts, conductor change math, and shift target tracker.
                </span>
              </>
            )}
            {transportRole === "passenger" && (
              <>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                  <Users className="w-4 h-4" /> Commuter/Passenger Active:
                </span>
                <span className="text-slate-300 hidden md:inline">
                  Check CBD terminal waiting queues, compute exact route fare in USD & ZiG, hail rides, and check lost property.
                </span>
              </>
            )}
            {transportRole === "operator" && (
              <>
                <span className="text-blue-400 font-bold flex items-center gap-1.5 text-xs">
                  <Building2 className="w-4 h-4" /> Fleet Operator Active:
                </span>
                <span className="text-slate-300 hidden md:inline">
                  Real-time omnibus telemetry, 1-day free trial, hire certified Class 2 drivers, and manage RBZ escrow.
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveTopic("ranks");
                setActiveTab("kombi");
              }}
              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 text-[11px] font-bold transition cursor-pointer"
            >
              CBD Ranks
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTopic("ranks");
                setActiveTab("fare_calc");
              }}
              className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-black transition cursor-pointer flex items-center gap-1"
            >
              <Calculator className="w-3 h-3 text-amber-400" />
              <span>Fare & Change</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTopic("driver_intel");
                setActiveTab("shift_tracker");
              }}
              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-blue-300 border border-slate-800 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
            >
              <Gauge className="w-3 h-3 text-blue-400" />
              <span>Shift Target</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTopic("commuter");
                setActiveTab("lost_found");
              }}
              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
            >
              <PackageSearch className="w-3 h-3 text-emerald-400" />
              <span>Lost Property</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TOP SUB-PAGE CONTROLLER (PAGES UNDER ACTIVE BIG TOPIC)       */}
        {/* ============================================================ */}
        <div className="pt-1 flex flex-col md:flex-row md:items-center justify-between gap-2 border-t border-slate-800/80">
          {/* Active Topic & Context Breadcrumb */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2 shadow-inner">
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                activeTopic === "ranks" ? "bg-amber-400" :
                activeTopic === "driver_intel" ? "bg-blue-400" :
                activeTopic === "commuter" ? "bg-emerald-400" : "bg-purple-400"
              }`}></span>
              <span>Topic:</span>
              <strong className="text-white">
                {activeTopic === "ranks" && "1. Kombi Terminals"}
                {activeTopic === "driver_intel" && "2. Road Hazards & Intel"}
                {activeTopic === "commuter" && "3. Commuter Rides"}
                {activeTopic === "fleet" && "4. Kombi Jobs & Fleet"}
              </strong>
            </span>
          </div>

          {/* Contextual Sub-Pages for the Active Topic */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {activeTopic === "ranks" && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("kombi")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === "kombi"
                      ? "bg-amber-500 text-slate-950 shadow-md font-black"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Bus className="w-3.5 h-3.5" />
                  <span>Page 1: CBD Departure Board</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === "kombi" ? "bg-slate-950 text-amber-400" : "bg-slate-800 text-slate-300"}`}>
                    {KOMBI_RANKS.length} Ranks
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("fare_calc")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === "fare_calc"
                      ? "bg-amber-500 text-slate-950 shadow-md font-black"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5 text-amber-400" />
                  <span>Page 2: Route Fares & Change Assistant</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === "fare_calc" ? "bg-slate-950 text-amber-400" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}>
                    USD & ZiG
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("cameras")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === "cameras"
                      ? "bg-amber-500 text-slate-950 shadow-md font-black"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Page 3: Live CCTV Feeds</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === "cameras" ? "bg-slate-950 text-amber-400" : "bg-purple-500/20 text-purple-300 border border-purple-500/30"}`}>
                    {cameras.length} CCTV
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("map")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === "map"
                      ? "bg-amber-500 text-slate-950 shadow-md font-black"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Page 4: Route & Rank Map</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === "map" ? "bg-slate-950 text-amber-400" : "bg-slate-800 text-slate-300"}`}>
                    {incidents.length} Live
                  </span>
                </button>
              </>
            )}

            {activeTopic === "driver_intel" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("community");
                    setCommunitySubTab("intel");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === "community" && communitySubTab === "intel"
                      ? "bg-blue-600 text-white shadow-md font-black"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Page 1: Driver Roadblock & Hazard Intel</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === "community" && communitySubTab === "intel" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"}`}>
                    {driverCommunityPosts.length} Reports
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("shift_tracker");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === "shift_tracker"
                      ? "bg-blue-600 text-white shadow-md font-black"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  <span>Page 2: Shift Target & Fuel Tracker</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === "shift_tracker" ? "bg-white/20 text-white" : "bg-amber-500/20 text-amber-300"}`}>
                    $70 Target
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("controllers")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === "controllers"
                      ? "bg-blue-600 text-white shadow-md font-black"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Page 3: Traffic Marshalls</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === "controllers" ? "bg-white/20 text-white" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
                    {trafficRequests.filter(r => r.status !== "resolved" && r.status !== "cancelled").length} Rescues
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("forum")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === "forum"
                      ? "bg-blue-600 text-white shadow-md font-black"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Page 4: Transport Forum</span>
                </button>
              </>
            )}

            {activeTopic === "commuter" && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("rides")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === "rides"
                      ? "bg-emerald-600 text-white shadow-md font-black"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Page 1: Passenger Hailing & Lift Network</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === "rides" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"}`}>
                    {rides.length} Live
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("lost_found")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === "lost_found"
                      ? "bg-emerald-600 text-white shadow-md font-black"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <PackageSearch className="w-3.5 h-3.5 text-amber-400" />
                  <span>Page 2: Kombi Lost & Found Noticeboard</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === "lost_found" ? "bg-white/20 text-white" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}`}>
                    Harare Transit
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("fare_calc")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === "fare_calc"
                      ? "bg-emerald-600 text-white shadow-md font-black"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5 text-blue-400" />
                  <span>Page 3: Route Fare Guide</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("payments");
                    setPaymentSubTab("escrow_vault");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === "payments" && paymentSubTab === "escrow_vault"
                      ? "bg-emerald-600 text-white shadow-md font-black"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Page 4: Digital Fare Escrow</span>
                </button>
              </>
            )}

            {activeTopic === "fleet" && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("kombi")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === "kombi"
                      ? "bg-amber-500 text-slate-950 shadow-md font-black"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  <span>Page 1: Driver Hiring & Notices</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("community");
                    setCommunitySubTab("marketplace");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === "community" && communitySubTab === "marketplace"
                      ? "bg-amber-500 text-slate-950 shadow-md font-black"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Page 2: Kombi Spares & Vehicles</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === "community" && communitySubTab === "marketplace" ? "bg-slate-950 text-amber-400" : "bg-slate-800 text-slate-300"}`}>
                    {marketplaceItems.length} Goods
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("payments");
                    setPaymentSubTab("fleet_pricing");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                    activeTab === "payments" && paymentSubTab === "fleet_pricing"
                      ? "bg-amber-500 text-slate-950 shadow-md font-black"
                      : "bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Page 3: Fleet Telematics (1-Day Free)</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === "payments" && paymentSubTab === "fleet_pricing" ? "bg-slate-950 text-amber-400" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}>
                    $0.00 Trial
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQrHub(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 bg-slate-900/80 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-500/40"
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>Page 4: Printable Car QR Stickers</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MAIN WORKSPACE VIEWPORT                                      */}
      {/* ============================================================ */}
      <main className="flex-1 overflow-hidden relative">
        {/* VIEW 1: MAP & REAL-TIME INCIDENT MONITOR */}
        {activeTab === "map" && (
          <div className="h-full w-full flex flex-col overflow-hidden relative">
            {/* Notification Banner: Alerts fleet owners when their 1-day free trial or subscription is within 24 hours of expiring */}
            <FleetTrialExpiryBanner
              subscription={activeFleetSubscription}
              onNavigateToPricing={() => {
                setActiveTab("payments");
                setPaymentSubTab("fleet_pricing");
              }}
              onExtendDemoHours={handleExtendDemoHours}
            />

            <div className="flex-1 w-full flex flex-col md:flex-row overflow-hidden relative">
              {/* Left Sidebar: Live Incident Feed & Alternate Routes */}
              <div className="w-full md:w-[420px] lg:w-[460px] h-1/2 md:h-full shrink-0 border-r border-slate-800 z-10 overflow-hidden flex flex-col">
              <IncidentFeed
                incidents={incidents}
                selectedIncident={selectedIncident}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
                onValidateIncident={handleValidateIncident}
                onRefuteIncident={handleRefuteIncident}
                onUpvoteIncident={handleUpvoteIncident}
                onReportIncident={handleReportIncident}
                onViewAlternateRoute={(inc) => {
                  setActiveRoutePlan({
                    id: `route-${inc.id}`,
                    name: `Detour for ${inc.location}`,
                    origin: "Harare CBD",
                    destination: inc.location,
                    distanceKm: 8.4,
                    durationMins: 14,
                    normalDurationMins: 35,
                    savedMins: 21,
                    condition: "optimal",
                    description: inc.alternateRoute,
                    arteries: ["Herbert Chitepo Ave", "Josiah Tongogara", "Dieppe Rd Bypass"],
                    coordinates: [
                      [-17.8292, 31.0522],
                      [-17.8210, 31.0560],
                      [-17.8180, 31.0650],
                      inc.coords,
                    ],
                  });
                }}
                onOpenVideo={(inc) => {
                  setActiveTab("cameras");
                }}
                onRequestControllerForIncident={handleOpenControllerModalForIncident}
              />
            </div>

            {/* Right Stage: Interactive Map Container */}
            <div className="flex-1 h-1/2 md:h-full relative">
              <HarareLeafletMap
                incidents={incidents}
                cameras={cameras}
                rides={rides}
                trafficControllers={trafficControllers}
                trafficRequests={trafficRequests}
                activeRoute={activeRoutePlan}
                selectedIncident={selectedIncident}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
                onSelectCamera={(cam) => {
                  setSelectedCamera(cam);
                  setActiveTab("cameras");
                }}
                filterType={filterType}
                showRanks={showRanks}
                showCameras={showCameras}
                showRides={showRides}
                showControllers={showControllersOnMap}
                trackedVehicle={
                  activeFleetSubscription && activeFleetSubscription.status !== "expired"
                    ? {
                        reg: activeFleetSubscription.vehicleReg,
                        ownerName: activeFleetSubscription.ownerName,
                        planName: activeFleetSubscription.planName,
                        isTrial: activeFleetSubscription.status === "trial_active",
                        expiresAt: activeFleetSubscription.expiresAt,
                      }
                    : null
                }
                onValidateIncident={handleValidateIncident}
                onRefuteIncident={handleRefuteIncident}
                onRequestControllerAtCoords={handleOpenControllerModalAtCoords}
                onMapClickCoord={(coords) => {
                  console.log("Map coordinate tapped:", coords);
                }}
              />

              {/* Map Floating Layer Controls */}
              <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-xl text-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Harare Map Layers
                </div>
                <button
                  onClick={() => setShowRanks(!showRanks)}
                  className={`px-2.5 py-1 rounded-lg text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                    showRanks ? "bg-emerald-500/20 text-emerald-300 font-semibold" : "text-slate-400"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Bus className="w-3.5 h-3.5" /> Kombi Ranks
                  </span>
                  <span>{showRanks ? "ON" : "OFF"}</span>
                </button>

                <button
                  onClick={() => setShowCameras(!showCameras)}
                  className={`px-2.5 py-1 rounded-lg text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                    showCameras ? "bg-purple-500/20 text-purple-300 font-semibold" : "text-slate-400"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> Live Cameras
                  </span>
                  <span>{showCameras ? "ON" : "OFF"}</span>
                </button>

                <button
                  onClick={() => setShowRides(!showRides)}
                  className={`px-2.5 py-1 rounded-lg text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                    showRides ? "bg-cyan-500/20 text-cyan-300 font-semibold" : "text-slate-400"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5" /> Ride Network
                  </span>
                  <span>{showRides ? "ON" : "OFF"}</span>
                </button>

                <button
                  onClick={() => setShowControllersOnMap(!showControllersOnMap)}
                  className={`px-2.5 py-1 rounded-lg text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                    showControllersOnMap ? "bg-amber-500/20 text-amber-300 font-semibold" : "text-slate-400"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Controllers & Rescues
                  </span>
                  <span>{showControllersOnMap ? "ON" : "OFF"}</span>
                </button>

                <div className="h-px bg-slate-800 my-0.5"></div>

                <button
                  onClick={() => {
                    setControllerModalPrefill({});
                    setShowControllerModal(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 via-amber-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-extrabold text-left transition flex items-center justify-between gap-1.5 border border-amber-400/40 cursor-pointer text-xs shadow-md"
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-200 animate-pulse" /> Need Controller?
                  </span>
                  <span className="text-[9px] bg-black/40 text-amber-300 px-1.5 py-0.5 rounded font-black">SOS</span>
                </button>

                <button
                  onClick={() => setActiveTab("community")}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 font-bold text-left transition flex items-center justify-between gap-1.5 border border-cyan-500/20 cursor-pointer text-xs"
                >
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400" /> Driver Community
                  </span>
                  <span className="bg-cyan-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full text-[10px]">
                    {driverCommunityPosts.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("community");
                    setCommunitySubTab("marketplace");
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-emerald-300 font-bold text-left transition flex items-center justify-between gap-1.5 border border-emerald-500/20 cursor-pointer text-xs"
                >
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" /> Marketplace
                  </span>
                  <span className="bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full text-[10px]">
                    {marketplaceItems.length}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* VIEW: DRIVER & COMMUTER COMMUNITY INTELLIGENCE & MARKETPLACE */}
        {activeTab === "community" && (
          <div className="h-full p-2 sm:p-4 max-w-6xl mx-auto overflow-hidden">
            <DriverCommunityHub
              posts={driverCommunityPosts}
              marketplaceItems={marketplaceItems}
              initialCommunitySubTab={communitySubTab}
              onAddPost={handleAddDriverPost}
              onAcknowledgePost={handleAcknowledgeDriverPost}
              onVotePost={handleVoteDriverPost}
              onReplyPost={handleReplyDriverPost}
              onViewOnMap={(coords) => {
                setActiveTab("map");
              }}
              onAddMarketplaceItem={handleAddMarketplaceItem}
              onLikeMarketplaceItem={handleLikeMarketplaceItem}
              onUpdateMarketplaceStatus={handleUpdateMarketplaceStatus}
            />
          </div>
        )}

        {/* VIEW: TRAFFIC CONTROLLERS & RESCUE DISPATCH HUB */}
        {activeTab === "controllers" && (
          <div className="h-full p-2 sm:p-4 max-w-6xl mx-auto overflow-hidden">
            <TrafficControllersHub
              controllers={trafficControllers}
              requests={trafficRequests}
              onRequestControllerClick={() => {
                setControllerModalPrefill({});
                setShowControllerModal(true);
              }}
              onUpdateStatus={handleUpdateControllerRequestStatus}
              onRateController={handleRateController}
              onViewOnMap={(coords) => {
                setActiveTab("map");
              }}
            />
          </div>
        )}

        {/* VIEW 2: RIDE NETWORK & TRANSIT PAY */}
        {activeTab === "rides" && (
          <div className="h-full p-3 sm:p-4 max-w-6xl mx-auto overflow-hidden">
            <RideNetwork
              rides={rides}
              onBookRide={(ride) => setSelectedRideForPayment(ride)}
              onPostRide={handlePostRide}
              onSelectOnMap={(coords) => {
                setActiveTab("map");
              }}
            />
          </div>
        )}

        {/* VIEW 3: KOMBI RANKS & OPERATOR BOARD */}
        {activeTab === "kombi" && (
          <div className="h-full p-3 sm:p-4 max-w-6xl mx-auto overflow-hidden">
            <KombiBoard posts={kombiPosts} onAddPost={handleAddKombiPost} />
          </div>
        )}

        {/* VIEW: KOMBI FARE & CONDUCTOR CHANGE CALCULATOR */}
        {activeTab === "fare_calc" && (
          <div className="h-full p-2 sm:p-4 max-w-5xl mx-auto overflow-hidden">
            <KombiFareCalculator
              initialRole={transportRole === "driver_conductor" ? "conductor" : "passenger"}
              onSelectRouteOnMap={(_routeId) => {
                setActiveTab("map");
              }}
            />
          </div>
        )}

        {/* VIEW: KOMBI DRIVER SHIFT & REVENUE TARGET TRACKER */}
        {activeTab === "shift_tracker" && (
          <div className="h-full p-2 sm:p-4 max-w-5xl mx-auto overflow-hidden">
            <KombiDriverShiftTracker />
          </div>
        )}

        {/* VIEW: KOMBI LOST PROPERTY NOTICEBOARD */}
        {activeTab === "lost_found" && (
          <div className="h-full p-2 sm:p-4 max-w-5xl mx-auto overflow-hidden">
            <KombiLostProperty />
          </div>
        )}

        {/* VIEW 4: LIVE VIDEO FEEDS */}
        {activeTab === "cameras" && (
          <div className="h-full p-3 sm:p-4 max-w-5xl mx-auto overflow-hidden">
            <LiveCameraViewer
              cameras={cameras}
              incidentsWithVideo={incidentsWithVideo}
              selectedCamera={selectedCamera}
              onSelectCamera={(cam) => setSelectedCamera(cam)}
              onOpenReportWithLocation={(loc) => {
                setActiveTab("map");
              }}
            />
          </div>
        )}

        {/* VIEW 5: TRAFFIC PREVENTION & COMMUNITY FORUM */}
        {activeTab === "forum" && (
          <div className="h-full p-3 sm:p-4 max-w-5xl mx-auto overflow-hidden">
            <TrafficPreventionForum
              ideas={communityIdeas}
              onVote={handleVoteIdea}
              onAddComment={handleAddComment}
              onAddIdea={handleAddIdea}
            />
          </div>
        )}

        {/* VIEW 6: ESCROW & FINANCIAL COMPLIANCE VAULT */}
        {activeTab === "payments" && (
          <div className="h-full p-3 sm:p-4 max-w-6xl mx-auto overflow-y-auto space-y-4">
            {/* Vault & Pricing Sub-Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setPaymentSubTab("fleet_pricing")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                    paymentSubTab === "fleet_pricing"
                      ? "bg-amber-500 text-slate-950 font-black shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Fleet Owner Pricing & Plans</span>
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      paymentSubTab === "fleet_pricing"
                        ? "bg-slate-950 text-amber-400"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    1-Day Free Trial
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentSubTab("escrow_vault")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
                    paymentSubTab === "escrow_vault"
                      ? "bg-emerald-500 text-slate-950 font-black shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>RBZ Escrow Vault & Receipts</span>
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      paymentSubTab === "escrow_vault"
                        ? "bg-slate-950 text-emerald-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {paymentHistory.length} Settled
                  </span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 pr-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-mono text-[11px]">EcoCash & InnBucks Live Gateway</span>
              </div>
            </div>

            {/* Sub-tab 1: Fleet Owner Pricing Table & 1-Day Free Trial */}
            {paymentSubTab === "fleet_pricing" && (
              <FleetPricingTable
                onPlanActivated={(sub) => {
                  setActiveFleetSubscription(sub);
                }}
                onNavigateToMap={() => setActiveTab("map")}
              />
            )}

            {/* Sub-tab 2: RBZ Escrow Vault & Compliance Ledger */}
            {paymentSubTab === "escrow_vault" && (
              <div className="space-y-4">
                {/* Header / Compliance Certifications */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">
                          Harare Regulated Transit Escrow Vault
                        </h3>
                        <p className="text-xs text-slate-400">
                          Compliant with Reserve Bank of Zimbabwe (RBZ) NPS Act & PCI-DSS Tokenization
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                        256-bit TLS AES Encrypted
                      </span>
                      <span className="text-[11px] bg-slate-800 text-slate-300 font-bold px-3 py-1 rounded-full border border-slate-700">
                        RBZ NPS-DIR-2024
                      </span>
                    </div>
                  </div>

                  {/* Regulatory Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                        <Lock className="w-3.5 h-3.5" /> Zero Storage of Raw Credentials
                      </span>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Cards are tokenized client-side (PCI-DSS Level 1 vault). Mobile money EcoCash and InnBucks PINs are authorized via direct customer USSD handset prompt.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                        <TrendingDown className="w-3.5 h-3.5" /> 2% Statutory IMTT Transparency
                      </span>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Compliant with national financial regulations, the 2% Intermediated Money Transfer Tax is calculated automatically with itemized driver payout receipts.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-purple-400 font-bold flex items-center gap-1 text-[11px]">
                        <Users className="w-3.5 h-3.5" /> Mutual Reciprocal Trust Scores
                      </span>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Upon escrow release, both the driver and the passenger rate each other and leave brief comments to ensure high road safety and commuter courtesy.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Transactions List */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      Recent Transit Escrow Settlements ({paymentHistory.length})
                    </h4>
                    <span className="text-xs text-slate-400">Audited National Ledger</span>
                  </div>

                  {paymentHistory.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      No payment records yet. Book a ride in the Ride Network to initiate an escrow-protected transit payment.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {paymentHistory.map((tx) => (
                        <div
                          key={tx.transactionId}
                          className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3 text-xs space-y-2 transition"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-amber-400">{tx.transactionId}</span>
                              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                                {tx.paymentMethod}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Token: {tx.tokenRef}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-emerald-400">
                                ${tx.amountUSD.toFixed(2)} USD ({tx.amountZiG} ZiG)
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                  tx.escrowStatus === "released_to_driver"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                }`}
                              >
                                {tx.escrowStatus === "released_to_driver" ? "Escrow Settled" : "Escrow Locked"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-900 pt-1.5">
                            <div>
                              Driver: <strong className="text-slate-200">{tx.driverName}</strong> • Passenger:{" "}
                              <strong className="text-slate-200">{tx.passengerName}</strong>
                            </div>
                            <div className="font-mono text-[10px] text-slate-500">
                              Digital Seal: {tx.compliance?.sha256ReceiptHash?.slice(0, 16)}...
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* 4 BIG TOPICS BOTTOM CONTROLLER DOCK                          */}
      {/* ============================================================ */}
      <footer className="bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-xl shrink-0 z-40 px-2 sm:px-4 py-2 shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-stretch justify-between gap-1.5 sm:gap-3">
          {/* Topic 1: Kombi Ranks & Fares */}
          <button
            type="button"
            onClick={() => handleSelectTopic("ranks")}
            className={`flex-1 min-w-0 py-2 sm:py-2.5 px-2 sm:px-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
              activeTopic === "ranks"
                ? "bg-gradient-to-b from-amber-500/25 to-amber-500/5 border border-amber-500/50 text-amber-300 shadow-lg shadow-amber-500/10"
                : "hover:bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/60"
            }`}
          >
            <div className="relative">
              <Bus className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 ${activeTopic === "ranks" ? "text-amber-400" : "text-slate-400"}`} />
              <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-slate-950">
                {KOMBI_RANKS.length}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-black tracking-tight mt-1 truncate w-full text-center">
              1. Kombi Ranks
            </span>
            <span className="text-[10px] hidden md:inline text-slate-400 truncate">
              Terminals • Fares • CCTV
            </span>
            {activeTopic === "ranks" && (
              <span className="absolute -bottom-1 w-10 sm:w-16 h-1 bg-amber-400 rounded-full shadow-sm shadow-amber-400"></span>
            )}
          </button>

          {/* Topic 2: Driver Intel & Road Hazards */}
          <button
            type="button"
            onClick={() => handleSelectTopic("driver_intel")}
            className={`flex-1 min-w-0 py-2 sm:py-2.5 px-2 sm:px-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
              activeTopic === "driver_intel"
                ? "bg-gradient-to-b from-blue-500/25 to-blue-500/5 border border-blue-500/50 text-blue-300 shadow-lg shadow-blue-500/10"
                : "hover:bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/60"
            }`}
          >
            <div className="relative">
              <ShieldAlert className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 ${activeTopic === "driver_intel" ? "text-blue-400" : "text-slate-400"}`} />
              <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-black bg-blue-500 text-white">
                {driverCommunityPosts.length}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-black tracking-tight mt-1 truncate w-full text-center">
              2. Driver Intel
            </span>
            <span className="text-[10px] hidden md:inline text-slate-400 truncate">
              Roadblocks • Targets • Rescues
            </span>
            {activeTopic === "driver_intel" && (
              <span className="absolute -bottom-1 w-10 sm:w-16 h-1 bg-blue-400 rounded-full shadow-sm shadow-blue-400"></span>
            )}
          </button>

          {/* Topic 3: Commuter & Passenger Rides */}
          <button
            type="button"
            onClick={() => handleSelectTopic("commuter")}
            className={`flex-1 min-w-0 py-2 sm:py-2.5 px-2 sm:px-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
              activeTopic === "commuter"
                ? "bg-gradient-to-b from-emerald-500/25 to-emerald-500/5 border border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/10"
                : "hover:bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/60"
            }`}
          >
            <div className="relative">
              <Users className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 ${activeTopic === "commuter" ? "text-emerald-400" : "text-slate-400"}`} />
              <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-black bg-emerald-500 text-slate-950">
                {rides.length}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-black tracking-tight mt-1 truncate w-full text-center">
              3. Commuter
            </span>
            <span className="text-[10px] hidden md:inline text-slate-400 truncate">
              Lifts • Lost Property • Fares
            </span>
            {activeTopic === "commuter" && (
              <span className="absolute -bottom-1 w-10 sm:w-16 h-1 bg-emerald-400 rounded-full shadow-sm shadow-emerald-400"></span>
            )}
          </button>

          {/* Topic 4: Fleet, Jobs & Spares */}
          <button
            type="button"
            onClick={() => handleSelectTopic("fleet")}
            className={`flex-1 min-w-0 py-2 sm:py-2.5 px-2 sm:px-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
              activeTopic === "fleet"
                ? "bg-gradient-to-b from-purple-500/25 to-purple-500/5 border border-purple-500/50 text-purple-300 shadow-lg shadow-purple-500/10"
                : "hover:bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/60"
            }`}
          >
            <div className="relative">
              <Building2 className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 ${activeTopic === "fleet" ? "text-purple-400" : "text-slate-400"}`} />
              <span className="absolute -top-1 -right-3.5 px-1 py-0.2 rounded-full text-[8px] font-black bg-amber-400 text-slate-950 uppercase tracking-tighter">
                Trial
              </span>
            </div>
            <span className="text-xs sm:text-sm font-black tracking-tight mt-1 truncate w-full text-center">
              4. Fleet & Spares
            </span>
            <span className="text-[10px] hidden md:inline text-slate-400 truncate">
              Telematics • Spares • Drivers
            </span>
            {activeTopic === "fleet" && (
              <span className="absolute -bottom-1 w-10 sm:w-16 h-1 bg-purple-400 rounded-full shadow-sm shadow-purple-400"></span>
            )}
          </button>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* MODALS & OVERLAYS                                            */}
      {/* ============================================================ */}

      {/* Payment & Mutual Rating Modal */}
      {selectedRideForPayment && (
        <PaymentModal
          ride={selectedRideForPayment}
          onClose={() => setSelectedRideForPayment(null)}
          onPaymentSuccess={handlePaymentSuccess}
          onRideCompleted={handleRideCompleted}
        />
      )}

      {/* Alternate Route Modal */}
      {activeRoutePlan && (
        <AlternateRouteModal
          route={activeRoutePlan}
          onClose={() => setActiveRoutePlan(null)}
        />
      )}

      {/* Traffic Controller Dispatch Modal */}
      {showControllerModal && (
        <TrafficControllerDispatchModal
          isOpen={showControllerModal}
          onClose={() => setShowControllerModal(false)}
          onRequestSubmitted={async (newReq) => {
            return await handleRequestController(newReq);
          }}
          initialLocation={controllerModalPrefill.location}
          initialCorridor={controllerModalPrefill.corridor}
          initialCoords={controllerModalPrefill.coords}
        />
      )}

      {/* Gemini AI Harare Route Advisor Drawer */}
      {showAiAdvisor && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-5 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Gemini AI Harare Route Advisor</h3>
                  <p className="text-xs text-slate-400">
                    Real-time detour analysis, kombi fare guidance, & congestion avoidance
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiAdvisor(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQueryAiAdvisor} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Origin</label>
                  <input
                    type="text"
                    required
                    value={aiOrigin}
                    onChange={(e) => setAiOrigin(e.target.value)}
                    placeholder="e.g. Copacabana or Avondale"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Destination</label>
                  <input
                    type="text"
                    required
                    value={aiDestination}
                    onChange={(e) => setAiDestination(e.target.value)}
                    placeholder="e.g. Chitungwiza Makoni or Borrowdale"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Specific Concern or Routing Need
                </label>
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="e.g. Avoid police checkpoints and robots down during rain..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAiAdvisor(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {aiLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{aiLoading ? "Consulting Harare AI..." : "Generate Alternate Plan"}</span>
                </button>
              </div>
            </form>

            {/* AI Advice Output Display */}
            {aiAdvice && (
              <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Harare Route & Transit Intelligence:</span>
                </div>
                <div className="whitespace-pre-line text-slate-200 leading-relaxed max-h-56 overflow-y-auto text-[11px] pr-1">
                  {aiAdvice}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4 Big Topics & Multi-Page Directory Modal */}
      <AppStructureModal
        isOpen={showStructureModal}
        onClose={() => setShowStructureModal(false)}
        onSelectPage={handleSelectPage}
      />
    </div>
  );
}
