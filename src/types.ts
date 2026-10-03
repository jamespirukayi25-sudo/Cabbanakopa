export type IncidentType =
  | "congestion"
  | "police"
  | "accident"
  | "robots_down"
  | "pothole"
  | "flooding"
  | "hazard";

export type SeverityLevel = "low" | "medium" | "high" | "critical";

export type VerificationStatus = "verified" | "unverified" | "disputed";

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  location: string;
  coords: [number, number]; // [lat, lng]
  severity: SeverityLevel;
  description: string;
  reportedBy: string;
  reporterRole: string;
  timestamp: string;
  upvotes: number; // confirmations / validations
  refutations: number; // refutations / disputes
  verificationStatus: VerificationStatus;
  hasVideo: boolean;
  videoUrl?: string;
  videoThumbnail?: string;
  alternateRoute: string;
  corridor?: string;
  status: "active" | "cleared";
}

export interface CameraFeed {
  id: string;
  name: string;
  intersection: string;
  status: "live" | "buffering" | "offline";
  currentCondition: string;
  coords: [number, number];
  viewers: number;
  lastUpdate: string;
  videoSource: string;
  poster: string;
}

export interface RideRating {
  id: string;
  rideId: string;
  ratingType: "passenger_to_driver" | "driver_to_passenger";
  reviewerName: string;
  reviewerRole: "passenger" | "driver";
  targetName: string;
  targetRole: "passenger" | "driver";
  stars: number; // 1 to 5
  comment: string;
  tags: string[];
  createdAt: string;
}

export interface PaymentTransaction {
  transactionId: string;
  rideId: string;
  amountUSD: number;
  amountZiG: number;
  imttTaxUSD: number; // 2% Reserve Bank of Zimbabwe statutory IMTT
  netDriverAmountUSD: number;
  paymentMethod: "EcoCash" | "InnBucks" | "OneMoney" | "Card" | "Cash";
  maskedIdentifier: string; // e.g. +263 77 ••• ••89 or •••• 4242
  tokenRef: string; // PCI-DSS tokenized reference
  driverName: string;
  passengerName: string;
  escrowStatus: "held_in_escrow" | "trip_in_progress" | "released_to_driver" | "refunded";
  timestamp: string;
  receiptNumber: string;
  compliance: {
    pciDssCompliant: boolean;
    rbzNpsReference: string;
    sha256ReceiptHash: string;
    encryption: string;
    amlKycTier: string;
  };
}

export interface Ride {
  id: string;
  type: "driver_offer" | "passenger_request";
  driverName?: string;
  driverPhone?: string;
  passengerName?: string;
  passengerPhone?: string;
  rating: number;
  totalTrips?: number;
  vehicle?: string;
  pickupLocation: string;
  pickupCoords: [number, number];
  destination: string;
  destinationCoords?: [number, number];
  distanceKm?: number;
  walkingMinutes?: number;
  matchScore?: number;
  departureTime?: string;
  preferredTime?: string;
  seatsAvailable?: number;
  seatsNeeded?: number;
  farePerSeatUSD?: number;
  farePerSeatZiG?: number;
  budgetUSD?: number;
  acceptedPayment: string[];
  notes?: string;
  status: "open" | "booked" | "completed";
  paymentStatus?: "unpaid" | "escrow_held" | "completed";
  tripStatus?: "scheduled" | "in_progress" | "completed";
  passengerRating?: RideRating;
  driverRating?: RideRating;
  transactionRef?: string;
}

export interface KombiPost {
  id: string;
  type: "owner_seeking_driver" | "driver_seeking_kombi";
  title: string;
  operatorName: string;
  contactPerson: string;
  phone: string;
  vehicleDetails: string;
  route: string;
  remuneration: string;
  requirements: string;
  location: string;
  postedDate: string;
  status: "active" | "filled";
}

export interface CommunityIdeaComment {
  id: string;
  author: string;
  text: string;
  time: string;
}

export interface CommunityIdea {
  id: string;
  author: string;
  badge: string;
  title: string;
  content: string;
  category: "Infrastructure" | "Commuter Transit" | "Traffic Management" | "Policy & Enforcement" | "General";
  upvotes: number;
  downvotes: number;
  commentsCount: number;
  comments: CommunityIdeaComment[];
  postedAt: string;
}

export interface AlternateRoutePlan {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
  durationMins: number;
  normalDurationMins: number;
  savedMins: number;
  condition: "optimal" | "congested" | "police_checkpoint";
  description: string;
  arteries: string[];
  coordinates: [number, number][];
}

export interface RankStatus {
  id: string;
  name: string;
  location: string;
  queueStatus: "Normal" | "Moderate" | "Packed / Overwhelmed";
  activeKombis: number;
  averageWaitTime: string;
  currentFareUSD: number;
  currentFareZiG: number;
  primaryRoutes: string[];
}

export type DriverInfoCategory =
  | "passenger_demand"
  | "road_checkpoint"
  | "traffic_detour"
  | "fuel_services"
  | "commuter_inquiry"
  | "lost_and_found"
  | "general_tip";

export type UserCommunityRole =
  | "commuter"
  | "kombi_driver"
  | "carpool_driver"
  | "rank_marshall"
  | "motorist"
  | "resident";

export interface DriverCommunityReply {
  id: string;
  author: string;
  role: UserCommunityRole;
  text: string;
  isDriver: boolean;
  timestamp: string;
  badge?: string;
}

export interface DriverCommunityPost {
  id: string;
  title: string;
  content: string;
  category: DriverInfoCategory;
  corridor: string;
  location: string;
  author: string;
  authorRole: UserCommunityRole;
  authorPhone?: string;
  urgency: "urgent" | "moderate" | "info";
  timestamp: string;
  driverAcknowledgments: number;
  driverConfirmed: boolean;
  upvotes: number;
  replies: DriverCommunityReply[];
  tags: string[];
  coords?: [number, number];
}

// Traffic Controller Service Interfaces
export type ControllerStatus = "on_duty" | "dispatched" | "on_scene" | "standby";

export interface TrafficController {
  id: string;
  name: string;
  badgeNumber: string;
  station: string;
  corridor: string;
  status: ControllerStatus;
  phone: string;
  currentIntersection: string;
  rating: number;
  intersectionsCleared: number;
  equipment: string[];
  coords: [number, number];
  vehicleType: "rapid_motorcycle" | "patrol_scooter" | "foot_marshall";
  assignedIncidentId?: string;
}

export type ControllerDispatchStatus =
  | "requested"
  | "assigned"
  | "en_route"
  | "on_scene"
  | "clearing_traffic"
  | "resolved"
  | "cancelled";

export type CongestionCause =
  | "robots_dead"
  | "accident_gridlock"
  | "kombi_bottleneck"
  | "narrow_bridge"
  | "rush_hour_deadlock"
  | "vip_roadblock"
  | "other";

export interface TrafficControllerRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  clientVehicle: string;
  location: string;
  corridor: string;
  congestionCause: CongestionCause;
  notes?: string;
  urgency: "critical" | "high" | "moderate";
  coords: [number, number];
  status: ControllerDispatchStatus;
  requestedAt: string;
  assignedController?: TrafficController;
  etaMinutes?: number;
  dispatchOfficerNotes?: string;
  feeUSD?: number;
  feeZiG?: number;
  paymentStatus: "free_community" | "service_fee" | "waived" | "paid";
  rating?: number;
  clientFeedback?: string;
}

// Community Marketplace Interfaces
export type MarketplaceCategory =
  | "cars_vehicles"
  | "gadgets_phones"
  | "electronics_laptops"
  | "auto_spares"
  | "home_solar"
  | "other_goods";

export type ItemCondition = "brand_new" | "used_like_new" | "used_good" | "refurbished";
export type MarketplaceStatus = "available" | "reserved" | "sold";

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  category: MarketplaceCategory;
  priceUSD: number;
  priceZiG?: number;
  isNegotiable: boolean;
  pictures: string[]; // Picture is mandatory (at least 1)
  location: string; // Location is mandatory (e.g. Suburb/Area in Harare)
  coords?: [number, number];
  sellerName: string;
  sellerPhone: string;
  sellerRole?: UserCommunityRole;
  whatsappNumber?: string;
  condition: ItemCondition;
  status: MarketplaceStatus;
  postedAt: string;
  views: number;
  likes: number;
  tags?: string[];
}

// QR Code & Signage Template Types
export type QrStickerType =
  | "car_windscreen"
  | "kombi_headrest"
  | "bus_stop_sign"
  | "kombi_rank_poster"
  | "driver_badge";

export interface QrStickerConfig {
  type: QrStickerType;
  title: string;
  subtitle: string;
  locationName: string; // e.g. "Copacabana Central Terminal" or "Car Dashboard"
  routeCorridor?: string; // e.g. "Copacabana ⇄ Chitungwiza"
  vehicleReg?: string; // e.g. "AEB 4920 (Fleet #12)"
  driverName?: string;
  targetUrl: string;
  includeHelpline: boolean;
  shonaSubtitle?: string;
  themeColor: "amber" | "emerald" | "blue" | "white";
}

// Fleet Subscription and Pricing Types
export type FleetPlanId = "trial_1day" | "owner_pro" | "fleet_enterprise" | "syndicate_custom";

export interface FleetSubscriptionTier {
  id: FleetPlanId;
  name: string;
  tagline: string;
  priceUSD: number;
  priceZiG: number;
  billingPeriod: "1_day_free" | "monthly" | "yearly" | "custom";
  isPopular?: boolean;
  badge?: string;
  maxVehicles: string;
  features: {
    title: string;
    highlight?: boolean;
  }[];
  ctaText: string;
  recommendedFor: string;
}

export interface ActiveFleetSubscription {
  planId: FleetPlanId;
  planName: string;
  status: "trial_active" | "subscribed" | "expired";
  activatedAt: string;
  expiresAt: string;
  vehicleReg: string;
  ownerName: string;
  ownerPhone: string;
  paymentMethod?: string;
  autoRenew: boolean;
}

