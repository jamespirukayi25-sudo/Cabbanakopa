import React, { useState, useMemo, useRef } from "react";
import {
  ShoppingBag,
  Car,
  Smartphone,
  Laptop,
  Wrench,
  Sun,
  Package,
  Plus,
  Search,
  MapPin,
  Tag,
  Phone,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Heart,
  Eye,
  X,
  Upload,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Filter,
  DollarSign,
  Share2,
  BadgeCheck,
  SlidersHorizontal,
  Sparkles,
  Info
} from "lucide-react";
import {
  MarketplaceItem,
  MarketplaceCategory,
  ItemCondition,
  MarketplaceStatus,
  UserCommunityRole
} from "../types";

interface CommunityMarketplaceProps {
  items: MarketplaceItem[];
  onAddItem: (newItem: Partial<MarketplaceItem>) => Promise<any>;
  onLikeItem?: (id: string) => Promise<void> | void;
  onUpdateStatus?: (id: string, status: MarketplaceStatus) => Promise<void> | void;
}

const CATEGORIES: {
  id: MarketplaceCategory | "all";
  label: string;
  icon: React.ElementType;
  badgeColor: string;
}[] = [
  { id: "all", label: "All Listings", icon: ShoppingBag, badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  { id: "cars_vehicles", label: "Cars & Vehicles", icon: Car, badgeColor: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
  { id: "gadgets_phones", label: "Phones & Gadgets", icon: Smartphone, badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  { id: "electronics_laptops", label: "Laptops & Electronics", icon: Laptop, badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
  { id: "auto_spares", label: "Auto Parts & Tyres", icon: Wrench, badgeColor: "text-orange-400 border-orange-500/30 bg-orange-500/10" },
  { id: "home_solar", label: "Solar & Power Backup", icon: Sun, badgeColor: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
  { id: "other_goods", label: "Other Goods", icon: Package, badgeColor: "text-slate-300 border-slate-700 bg-slate-800" }
];

const HARARE_LOCATIONS = [
  "All Harare",
  "Avondale / Avondale West",
  "Harare CBD / Copacabana",
  "Belvedere",
  "Borrowdale / Sam Levy's",
  "Chitungwiza (Town Centre/Makoni)",
  "Eastlea",
  "Graniteside Industrial",
  "Highfield / Machipisa",
  "Kuwadzana / Bulawayo Rd",
  "Market Square / Charge Office",
  "Mbare / Magaba",
  "Mount Pleasant",
  "Msasa Industrial",
  "Warren Park",
  "Westgate / Bluffhill"
];

const SAMPLE_IMAGE_PRESETS = [
  {
    name: "Toyota Wish / Car",
    category: "cars_vehicles" as MarketplaceCategory,
    url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Sedan / Hatchback",
    category: "cars_vehicles" as MarketplaceCategory,
    url: "https://images.unsplash.com/photo-1590362891988-f77804702088?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "iPhone / Smartphone",
    category: "gadgets_phones" as MarketplaceCategory,
    url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Laptop / Ultrabook",
    category: "electronics_laptops" as MarketplaceCategory,
    url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Car Dash Cam",
    category: "gadgets_phones" as MarketplaceCategory,
    url: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Tyres & Spares",
    category: "auto_spares" as MarketplaceCategory,
    url: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Solar & Inverter",
    category: "home_solar" as MarketplaceCategory,
    url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80"
  }
];

export const CommunityMarketplace: React.FC<CommunityMarketplaceProps> = ({
  items,
  onAddItem,
  onLikeItem,
  onUpdateStatus
}) => {
  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | "all">("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("All Harare");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "popular">("newest");
  const [currencyView, setCurrencyView] = useState<"USD" | "ZiG">("USD");

  // Item Detail Modal
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);

  // Sell Modal States
  const [showPostModal, setShowPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postCategory, setPostCategory] = useState<MarketplaceCategory>("cars_vehicles");
  const [postPriceUSD, setPostPriceUSD] = useState<string>("");
  const [postIsNegotiable, setPostIsNegotiable] = useState(true);
  const [postLocation, setPostLocation] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postCondition, setPostCondition] = useState<ItemCondition>("used_good");
  const [postSellerName, setPostSellerName] = useState("");
  const [postSellerPhone, setPostSellerPhone] = useState("");
  const [postWhatsapp, setPostWhatsapp] = useState("");
  const [postSellerRole, setPostSellerRole] = useState<UserCommunityRole>("commuter");

  // Picture handling (REQUIRED)
  const [postImages, setPostImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitValidationErrors, setSubmitValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered and sorted listings
  const filteredItems = useMemo(() => {
    let list = [...items];

    if (selectedCategory !== "all") {
      list = list.filter((item) => item.category === selectedCategory);
    }

    if (selectedLocation !== "All Harare") {
      const locClean = selectedLocation.split(" ")[0].toLowerCase();
      list = list.filter((item) => item.location.toLowerCase().includes(locClean));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (sortBy === "price_asc") {
      list.sort((a, b) => a.priceUSD - b.priceUSD);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.priceUSD - a.priceUSD);
    } else if (sortBy === "popular") {
      list.sort((a, b) => (b.likes * 2 + b.views) - (a.likes * 2 + a.views));
    }

    return list;
  }, [items, selectedCategory, selectedLocation, searchQuery, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const cars = items.filter((i) => i.category === "cars_vehicles").length;
    const gadgets = items.filter((i) => i.category === "gadgets_phones" || i.category === "electronics_laptops").length;
    const spares = items.filter((i) => i.category === "auto_spares").length;
    return { total, cars, gadgets, spares };
  }, [items]);

  // Handle local image file upload -> convert to Data URL for instant rendering
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    // Limit size to ~5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image is too large. Please select a photo under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPostImages((prev) => [result, ...prev]);
        setUploadError(null);
      }
    };
    reader.onerror = () => {
      setUploadError("Failed to read image file. Please try another picture.");
    };
    reader.readAsDataURL(file);
  };

  const handleAddCustomImageUrl = () => {
    if (!customImageUrl.trim()) return;
    try {
      new URL(customImageUrl.trim());
      setPostImages((prev) => [...prev, customImageUrl.trim()]);
      setCustomImageUrl("");
      setUploadError(null);
    } catch {
      setUploadError("Please enter a valid image web URL (e.g. starting with https://).");
    }
  };

  const handleSelectPreset = (url: string) => {
    if (!postImages.includes(url)) {
      setPostImages((prev) => [...prev, url]);
      setUploadError(null);
    }
  };

  const handleRemoveImage = (index: number) => {
    setPostImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Listing Form
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    // MANDATORY VALIDATIONS PER USER DIRECTIVE: Picture, Price, Location
    if (postImages.length === 0) {
      errors.push("A picture of the item is required. Please upload or choose a photo.");
    }

    const numPrice = Number(postPriceUSD);
    if (!postPriceUSD || isNaN(numPrice) || numPrice <= 0) {
      errors.push("A valid price is required (e.g. $4,800 USD).");
    }

    if (!postLocation.trim()) {
      errors.push("A pickup/viewing location in Harare is required (e.g. Avondale, CBD, Borrowdale).");
    }

    if (!postTitle.trim()) {
      errors.push("An item title is required.");
    }

    if (errors.length > 0) {
      setSubmitValidationErrors(errors);
      return;
    }

    setSubmitValidationErrors([]);
    setIsSubmitting(true);

    try {
      const calculatedZiG = Math.round(numPrice * 28);
      await onAddItem({
        title: postTitle.trim(),
        description: postDescription.trim() || `Clean ${postTitle.trim()} available for viewing in ${postLocation.trim()}.`,
        category: postCategory,
        priceUSD: numPrice,
        priceZiG: calculatedZiG,
        isNegotiable: postIsNegotiable,
        pictures: postImages,
        location: postLocation.trim(),
        sellerName: postSellerName.trim() || "Harare Community Member",
        sellerPhone: postSellerPhone.trim() || "+263 77 000 0000",
        whatsappNumber: postWhatsapp.trim() || postSellerPhone.trim() || "+263770000000",
        sellerRole: postSellerRole,
        condition: postCondition,
        status: "available",
        tags: [postTitle.trim().split(" ")[0], postCategory.replace("_", " ")]
      });

      // Reset form
      setShowPostModal(false);
      setPostTitle("");
      setPostPriceUSD("");
      setPostLocation("");
      setPostDescription("");
      setPostImages([]);
      setPostSellerName("");
      setPostSellerPhone("");
      setPostWhatsapp("");
    } catch (err: any) {
      console.error("Listing creation error:", err);
      setSubmitValidationErrors([err.message || "Failed to create marketplace listing."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-fill preset template when user clicks preset buttons
  const handleQuickCreateTemplate = (type: "car" | "phone" | "laptop" | "spares") => {
    setShowPostModal(true);
    if (type === "car") {
      setPostCategory("cars_vehicles");
      setPostTitle("2014 Mazda Demio SkyActiv 1.3L - Petrol Saver");
      setPostPriceUSD("3600");
      setPostLocation("Avondale / Westgate, Harare");
      setPostDescription("Very clean runabout doing 20km/L in Harare traffic. Push to start, keyless entry, cold AC, Zinara up to date. Ready for immediate change of ownership.");
      setPostImages(["https://images.unsplash.com/photo-1590362891988-f77804702088?auto=format&fit=crop&w=800&q=80"]);
      setPostCondition("used_good");
    } else if (type === "phone") {
      setPostCategory("gadgets_phones");
      setPostTitle("iPhone 13 128GB Midnight (Face ID 100%, 88% Battery)");
      setPostPriceUSD("480");
      setPostLocation("Harare CBD / Eastgate Mall");
      setPostDescription("Factory unlocked dual SIM, with original charger cable and case. No cracks or scratches. Testing welcomed at safe CBD cafe.");
      setPostImages(["https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80"]);
      setPostCondition("used_like_new");
    } else if (type === "laptop") {
      setPostCategory("electronics_laptops");
      setPostTitle("Lenovo ThinkPad T490 (Core i5 8th Gen, 16GB RAM, 256GB SSD)");
      setPostPriceUSD("290");
      setPostLocation("Belvedere, Harare");
      setPostDescription("Durable ThinkPad keyboard, backlit, 5-hour battery life. Windows 11 Pro activated. Excellent for transit navigation or office work.");
      setPostImages(["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80"]);
      setPostCondition("refurbished");
    } else if (type === "spares") {
      setPostCategory("auto_spares");
      setPostTitle("Heavy Duty 12V 70Ah Maintenance-Free Car Battery");
      setPostPriceUSD("75");
      setPostLocation("Graniteside / Seke Road, Harare");
      setPostDescription("Brand new with 1-year warranty card. Perfect for kombis, Toyota Wish, and sedan starters. Free terminal check.");
      setPostImages(["https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80"]);
      setPostCondition("brand_new");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Top Header Banner */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center font-black shadow-md">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                Harare Community Marketplace
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Peer-to-Peer Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Buy and sell cars, gadgets, auto spares, electronics, and solar gear within the Harare commuter and driver network.{" "}
              <strong className="text-amber-300 font-semibold">
                Every listing strictly requires a photo, price, and Harare pickup location.
              </strong>
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setSubmitValidationErrors([]);
                setShowPostModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Sell An Item</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights / Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Goods</div>
              <div className="text-sm font-black text-white">{stats.total} listings</div>
            </div>
            <ShoppingBag className="w-4 h-4 text-slate-500" />
          </div>

          <div className="bg-slate-950/70 border border-blue-900/40 rounded-xl p-2 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-blue-300 uppercase font-semibold">Cars & Vehicles</div>
              <div className="text-sm font-black text-blue-400">{stats.cars} on offer</div>
            </div>
            <Car className="w-4 h-4 text-blue-400" />
          </div>

          <div className="bg-slate-950/70 border border-emerald-900/40 rounded-xl p-2 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-emerald-300 uppercase font-semibold">Gadgets & Phones</div>
              <div className="text-sm font-black text-emerald-400">{stats.gadgets} available</div>
            </div>
            <Smartphone className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="bg-slate-950/70 border border-orange-900/40 rounded-xl p-2 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-orange-300 uppercase font-semibold">Spares & Tyres</div>
              <div className="text-sm font-black text-orange-400">{stats.spares} parts</div>
            </div>
            <Wrench className="w-4 h-4 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Category Pills & Filters Bar */}
      <div className="p-3 bg-slate-950/90 border-b border-slate-800 space-y-2.5 shrink-0">
        {/* Category Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap border shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                    : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-slate-950" : "text-amber-400"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search, Location, and Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cars, iPhones, laptops, dash cams, tyres..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Location Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="pl-7 pr-7 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-semibold focus:outline-none focus:border-amber-500/50 cursor-pointer appearance-none"
              >
                {HARARE_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-slate-900 text-white">
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 font-semibold focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>

            {/* Currency Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-[11px] font-extrabold">
              <button
                onClick={() => setCurrencyView("USD")}
                className={`px-2 py-1 rounded-lg transition ${
                  currencyView === "USD" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                USD $
              </button>
              <button
                onClick={() => setCurrencyView("ZiG")}
                className={`px-2 py-1 rounded-lg transition ${
                  currencyView === "ZiG" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                ZiG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Item Cards */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/40 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-amber-400 flex items-center justify-center mb-3">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No Listings Found</h3>
            <p className="text-xs text-slate-400 mb-4 max-w-sm">
              We couldn't find any goods matching "{searchQuery}" in {selectedLocation}. Be the first in your suburb to list an item!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedLocation("All Harare");
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
              >
                Clear Filters
              </button>
              <button
                onClick={() => {
                  setSubmitValidationErrors([]);
                  setShowPostModal(true);
                }}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition shadow"
              >
                + Post New Listing
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              const primaryPic = item.pictures && item.pictures[0] ? item.pictures[0] : "";
              const formattedPrice =
                currencyView === "USD"
                  ? `$${item.priceUSD.toLocaleString()}`
                  : `${(item.priceZiG || Math.round(item.priceUSD * 28)).toLocaleString()} ZiG`;

              const conditionLabel =
                item.condition === "brand_new"
                  ? "Brand New"
                  : item.condition === "used_like_new"
                  ? "Like New"
                  : item.condition === "refurbished"
                  ? "Refurbished"
                  : "Good Condition";

              const conditionColor =
                item.condition === "brand_new"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : item.condition === "used_like_new"
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                  : "bg-slate-800 text-slate-300 border-slate-700";

              const isSold = item.status === "sold";
              const isReserved = item.status === "reserved";

              return (
                <div
                  key={item.id}
                  className={`group flex flex-col bg-slate-950/80 border rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-200 shadow-lg hover:shadow-amber-500/5 ${
                    isSold ? "opacity-60 border-slate-800" : "border-slate-800/90"
                  }`}
                >
                  {/* Photo Container (REQUIRED VISUAL) */}
                  <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden cursor-pointer" onClick={() => setSelectedItem(item)}>
                    {primaryPic ? (
                      <img
                        src={primaryPic}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                        <ShoppingBag className="w-10 h-10" />
                      </div>
                    )}

                    {/* Image overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>

                    {/* Condition Pill & Status Pill */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border backdrop-blur-md ${conditionColor}`}>
                        {conditionLabel}
                      </span>
                      {isSold && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-500 text-white shadow">
                          SOLD
                        </span>
                      )}
                      {isReserved && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow">
                          RESERVED
                        </span>
                      )}
                    </div>

                    {/* Multiple Pictures Indicator */}
                    {item.pictures && item.pictures.length > 1 && (
                      <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-black px-2 py-0.5 rounded-md border border-white/20">
                        1/{item.pictures.length} photos
                      </div>
                    )}

                    {/* Price Tag Overlay (REQUIRED) */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-baseline justify-between gap-1">
                      <div className="flex flex-col">
                        <span className="text-lg sm:text-xl font-black text-amber-400 tracking-tight drop-shadow-md">
                          {formattedPrice}
                        </span>
                        {currencyView === "USD" && item.priceZiG && (
                          <span className="text-[10px] text-slate-300 font-semibold drop-shadow">
                            ≈ {item.priceZiG.toLocaleString()} ZiG
                          </span>
                        )}
                      </div>
                      {item.isNegotiable && (
                        <span className="text-[9px] bg-slate-900/90 border border-slate-700 text-amber-300 font-bold px-1.5 py-0.5 rounded">
                          Negotiable
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
                    <div className="space-y-1.5">
                      {/* Title */}
                      <h4
                        onClick={() => setSelectedItem(item)}
                        className="text-sm font-bold text-white line-clamp-1 hover:text-amber-400 transition cursor-pointer"
                        title={item.title}
                      >
                        {item.title}
                      </h4>

                      {/* Location Badge (REQUIRED) */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate font-medium">{item.location}</span>
                      </div>

                      {/* Snippet */}
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Seller & Action Row */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="truncate font-medium text-slate-300">
                          {item.sellerName}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0">{item.postedAt}</span>
                      </div>

                      {/* Communication Actions: WhatsApp & Call */}
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <a
                          href={`https://wa.me/${(item.whatsappNumber || item.sellerPhone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Hi ${item.sellerName}, I am interested in your "${item.title}" listed for $${item.priceUSD} on Coppakabana Marketplace in ${item.location}. Is it still available?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-center text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={`tel:${item.sellerPhone}`}
                          className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-center text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          <span>Call</span>
                        </a>
                      </div>

                      {/* Detail & Like */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Full Specifications</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => onLikeItem && onLikeItem(item.id)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        >
                          <Heart className="w-3.5 h-3.5 hover:fill-rose-500" />
                          <span>{item.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Safety Notice Footer */}
      <div className="p-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 px-4 shrink-0">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong className="text-slate-200">Harare Safe Trading Tip:</strong> Always meet in bustling, public locations (e.g., Copacabana Rank, Eastgate, or major shopping centers). Inspect items before paying.
          </span>
        </div>
        <button
          onClick={() => {
            setSubmitValidationErrors([]);
            setShowPostModal(true);
          }}
          className="hidden sm:inline-flex text-xs text-amber-400 font-extrabold hover:underline"
        >
          Sell Your Item &rarr;
        </button>
      </div>

      {/* ========================================================================= */}
      {/* POST NEW ITEM MODAL (Enforces Picture, Price, Location strictly)           */}
      {/* ========================================================================= */}
      {showPostModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">List Item on Community Marketplace</h3>
                  <p className="text-[11px] text-slate-400">
                    Cars, gadgets, electronics, spares, and goods for sale in Harare
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPostModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Form */}
            <form onSubmit={handleSubmitPost} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Validation Alert Box */}
              {submitValidationErrors.length > 0 && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Please complete the required listing information:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-300/90 pl-1">
                    {submitValidationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Fill Templates (Useful for quick tests) */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5" /> Quick Template Autofill:
                  </span>
                  <span className="text-[10px] text-slate-500">Tap to populate sample details</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickCreateTemplate("car")}
                    className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1 justify-center transition cursor-pointer"
                  >
                    <Car className="w-3 h-3 text-blue-400" /> Mazda Demio
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCreateTemplate("phone")}
                    className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 justify-center transition cursor-pointer"
                  >
                    <Smartphone className="w-3 h-3 text-emerald-400" /> iPhone 13
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCreateTemplate("laptop")}
                    className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-purple-300 rounded-lg text-xs font-semibold flex items-center gap-1 justify-center transition cursor-pointer"
                  >
                    <Laptop className="w-3 h-3 text-purple-400" /> ThinkPad T490
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCreateTemplate("spares")}
                    className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-orange-300 rounded-lg text-xs font-semibold flex items-center gap-1 justify-center transition cursor-pointer"
                  >
                    <Wrench className="w-3 h-3 text-orange-400" /> Car Battery
                  </button>
                </div>
              </div>

              {/* 1. PICTURE REQUIREMENT (Mandatory) */}
              <div className="space-y-2 p-3.5 bg-slate-950/70 border border-slate-800/90 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <span>1. Item Picture / Photos</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 font-black px-1.5 py-0.2 rounded border border-amber-500/30">
                      REQUIRED
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {postImages.length > 0 ? `${postImages.length} image(s) added` : "At least 1 photo required"}
                  </span>
                </div>

                {/* Upload & Preset Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* File Upload Button */}
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-18 border-2 border-dashed border-slate-700 hover:border-amber-400/70 bg-slate-900/60 rounded-xl p-2 flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      <Upload className="w-5 h-5 text-amber-400" />
                      <span className="text-xs font-bold">Upload Photo from Device</span>
                      <span className="text-[9px] text-slate-500">JPG, PNG, WebP up to 5MB</span>
                    </button>
                  </div>

                  {/* Or Web Image URL */}
                  <div className="flex flex-col justify-between p-2 bg-slate-900/60 border border-slate-800 rounded-xl gap-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold">Or paste image web link:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="url"
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomImageUrl}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
                  </p>
                )}

                {/* Instant Sample Presets Bar */}
                <div className="pt-1">
                  <div className="text-[10px] text-slate-400 font-semibold mb-1">
                    Or select from instant Harare sample photos:
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {SAMPLE_IMAGE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(preset.url)}
                        className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 border border-slate-700 hover:border-amber-400 rounded-lg text-[10px] text-slate-300 font-medium shrink-0 cursor-pointer transition"
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-4 h-4 rounded object-cover"
                        />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thumbnails of Selected Images */}
                {postImages.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[10px] text-slate-400 font-semibold mb-1.5">Selected Photos:</div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {postImages.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 group shrink-0">
                          <img src={img} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 cursor-pointer"
                            title="Remove image"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. PRICE & LOCATION REQUIREMENTS (Mandatory) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* PRICE INPUT (REQUIRED) */}
                <div className="space-y-1.5 p-3.5 bg-slate-950/70 border border-slate-800/90 rounded-xl">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-white flex items-center gap-1">
                      <span>2. Price in USD ($)</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 font-black px-1.5 py-0.2 rounded border border-amber-500/30">
                        REQUIRED
                      </span>
                    </label>
                  </div>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-400" />
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={postPriceUSD}
                      onChange={(e) => setPostPriceUSD(e.target.value)}
                      placeholder="e.g. 4800 or 750"
                      className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">
                      Estimated:{" "}
                      <strong className="text-amber-300">
                        {postPriceUSD && !isNaN(Number(postPriceUSD))
                          ? `${(Number(postPriceUSD) * 28).toLocaleString()} ZiG`
                          : "0 ZiG"}
                      </strong>
                    </span>
                    <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={postIsNegotiable}
                        onChange={(e) => setPostIsNegotiable(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                      />
                      <span>Negotiable</span>
                    </label>
                  </div>
                </div>

                {/* LOCATION INPUT (REQUIRED) */}
                <div className="space-y-1.5 p-3.5 bg-slate-950/70 border border-slate-800/90 rounded-xl">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-white flex items-center gap-1">
                      <span>3. Harare Location</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 font-black px-1.5 py-0.2 rounded border border-amber-500/30">
                        REQUIRED
                      </span>
                    </label>
                  </div>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-rose-400" />
                    <input
                      type="text"
                      required
                      value={postLocation}
                      onChange={(e) => setPostLocation(e.target.value)}
                      placeholder="e.g. Avondale, CBD, Borrowdale, Chitungwiza..."
                      className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  {/* Quick Suburb Suggestions */}
                  <div className="flex items-center gap-1 overflow-x-auto pt-0.5 no-scrollbar">
                    {["Avondale", "Harare CBD", "Borrowdale", "Belvedere", "Eastlea", "Chitungwiza"].map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setPostLocation(loc)}
                        className="text-[9px] px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 whitespace-nowrap cursor-pointer"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. TITLE & CATEGORY */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Item Title & Brand / Model <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="e.g. 2015 Toyota Wish, iPhone 14 Pro Max, Bridgestone Tyres..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="cars_vehicles">Cars & Vehicles</option>
                    <option value="gadgets_phones">Phones & Gadgets</option>
                    <option value="electronics_laptops">Laptops & Electronics</option>
                    <option value="auto_spares">Auto Parts & Tyres</option>
                    <option value="home_solar">Solar & Power Backup</option>
                    <option value="other_goods">Other Goods</option>
                  </select>
                </div>
              </div>

              {/* 4. CONDITION & DESCRIPTION */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Condition</label>
                  <select
                    value={postCondition}
                    onChange={(e) => setPostCondition(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="brand_new">Brand New (Sealed/Fresh)</option>
                    <option value="used_like_new">Used - Like New</option>
                    <option value="used_good">Used - Good Condition</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-300">Specifications & Notes</label>
                  <textarea
                    rows={2}
                    value={postDescription}
                    onChange={(e) => setPostDescription(e.target.value)}
                    placeholder="Key specifications, mileage, battery health, papers, reason for selling..."
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>

              {/* 5. SELLER CONTACT DETAILS */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Seller Contact Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold">Your Name</label>
                    <input
                      type="text"
                      value={postSellerName}
                      onChange={(e) => setPostSellerName(e.target.value)}
                      placeholder="e.g. Farai or Tendai"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold">Phone (Calling)</label>
                    <input
                      type="text"
                      value={postSellerPhone}
                      onChange={(e) => setPostSellerPhone(e.target.value)}
                      placeholder="+263 77 123 4567"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold">WhatsApp Number</label>
                    <input
                      type="text"
                      value={postWhatsapp}
                      onChange={(e) => setPostWhatsapp(e.target.value)}
                      placeholder="+263 71 890 1234"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Publishing Listing...</span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Post Listing Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ITEM DETAIL & SPECIFICATIONS MODAL                                        */}
      {/* ========================================================================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-[1250] flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-500/20 text-amber-400 font-extrabold px-2 py-0.5 rounded-md border border-amber-500/30 uppercase">
                  {selectedItem.category.replace("_", " ")}
                </span>
                <h3 className="text-base font-extrabold text-white truncate max-w-md">
                  {selectedItem.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Photo Showcase */}
              <div className="relative aspect-video sm:aspect-[16/9] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
                <img
                  src={selectedItem.pictures[0]}
                  alt={selectedItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                    {selectedItem.condition.replace("_", " ").toUpperCase()}
                  </span>
                  {selectedItem.status !== "available" && (
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950">
                      {selectedItem.status.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Location Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <div>
                  <div className="text-xs text-slate-400">Asking Price:</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">
                      ${selectedItem.priceUSD.toLocaleString()} USD
                    </span>
                    {selectedItem.priceZiG && (
                      <span className="text-xs font-bold text-slate-400">
                        ({selectedItem.priceZiG.toLocaleString()} ZiG)
                      </span>
                    )}
                  </div>
                  {selectedItem.isNegotiable && (
                    <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded">
                      Open to reasonable cash offers
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>Pickup / Viewing Location:</span>
                  </div>
                  <div className="text-sm font-bold text-white bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                    {selectedItem.location}
                  </div>
                </div>
              </div>

              {/* Description & Full Details */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Item Description & Condition
                </h4>
                <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedItem.description}
                </div>
              </div>

              {/* Safe Trading Advisory */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-amber-300">Harare Transit Buyer Safety:</span>
                  <p className="text-slate-300 text-[11px]">
                    Arrange test drives or gadget testing in open daylight at major landmarks (e.g. Copacabana Terminal, Avondale Shopping Centre, Eastgate, or service stations). Never make upfront non-refundable payments.
                  </p>
                </div>
              </div>

              {/* Seller Contact Box */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400">Listed by Community Member:</div>
                    <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      <span>{selectedItem.sellerName}</span>
                      <BadgeCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500">Posted on:</div>
                    <div className="text-xs text-slate-300 font-semibold">{selectedItem.postedAt}</div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <a
                    href={`https://wa.me/${(selectedItem.whatsappNumber || selectedItem.sellerPhone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Hello ${selectedItem.sellerName}, I saw your listing for "${selectedItem.title}" on Coppakabana Community Marketplace ($${selectedItem.priceUSD} in ${selectedItem.location}). I would like to arrange viewing.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </a>

                  <a
                    href={`tel:${selectedItem.sellerPhone}`}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>Call Seller ({selectedItem.sellerPhone})</span>
                  </a>
                </div>

                {/* Toggle Status (Mark as sold / reserved) */}
                {onUpdateStatus && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Listing Status:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateStatus(selectedItem.id, "available");
                          setSelectedItem((prev) => (prev ? { ...prev, status: "available" } : null));
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          selectedItem.status === "available"
                            ? "bg-emerald-500 text-slate-950 font-black"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        Available
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateStatus(selectedItem.id, "reserved");
                          setSelectedItem((prev) => (prev ? { ...prev, status: "reserved" } : null));
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          selectedItem.status === "reserved"
                            ? "bg-amber-500 text-slate-950 font-black"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        Reserved
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateStatus(selectedItem.id, "sold");
                          setSelectedItem((prev) => (prev ? { ...prev, status: "sold" } : null));
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          selectedItem.status === "sold"
                            ? "bg-rose-500 text-white font-black"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        Mark Sold
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs px-4">
              <span className="text-slate-500 text-[11px]">
                {selectedItem.views} views • {selectedItem.likes} favorites
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
