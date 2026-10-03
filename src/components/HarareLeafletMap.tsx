import React, { useEffect, useRef } from "react";
import L from "leaflet";
import {
  Incident,
  CameraFeed,
  Ride,
  AlternateRoutePlan,
  TrafficController,
  TrafficControllerRequest
} from "../types";
import { KOMBI_RANKS } from "../data/harareData";

interface MapProps {
  incidents: Incident[];
  cameras: CameraFeed[];
  rides: Ride[];
  trafficControllers?: TrafficController[];
  trafficRequests?: TrafficControllerRequest[];
  activeRoute: AlternateRoutePlan | null;
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onSelectCamera: (camera: CameraFeed) => void;
  filterType: string;
  statusFilter?: string;
  showRanks: boolean;
  showCameras: boolean;
  showRides: boolean;
  showControllers?: boolean;
  trackedVehicle?: {
    reg: string;
    ownerName?: string;
    planName?: string;
    isTrial?: boolean;
    expiresAt?: string;
  } | null;
  onValidateIncident?: (id: string) => void;
  onRefuteIncident?: (id: string) => void;
  onMapClickCoord?: (coords: [number, number]) => void;
  onRequestControllerAtCoords?: (coords: [number, number], locationName?: string) => void;
}

export const HarareLeafletMap: React.FC<MapProps> = ({
  incidents,
  cameras,
  rides,
  trafficControllers = [],
  trafficRequests = [],
  activeRoute,
  selectedIncident,
  onSelectIncident,
  onSelectCamera,
  filterType,
  statusFilter = "all",
  showRanks,
  showCameras,
  showRides,
  showControllers = true,
  trackedVehicle = null,
  onValidateIncident,
  onRefuteIncident,
  onMapClickCoord,
  onRequestControllerAtCoords,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Setup window global for controller request action from popup
  useEffect(() => {
    (window as any).harareRequestControllerHere = (lat: number, lng: number, locName: string) => {
      if (onRequestControllerAtCoords) {
        onRequestControllerAtCoords([lat, lng], locName);
      }
    };
    return () => {
      delete (window as any).harareRequestControllerHere;
    };
  }, [onRequestControllerAtCoords]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered on Harare CBD
    const map = L.map(mapContainerRef.current, {
      center: [-17.8292, 31.0522],
      zoom: 13,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false,
    });

    // Add CartoDB Dark Matter tiles with fallback to standard OSM
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; OpenStreetMap',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    map.on("click", (e: L.LeafletMouseEvent) => {
      if (onMapClickCoord) {
        onMapClickCoord([e.latlng.lat, e.latlng.lng]);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers and Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    // Attach global handlers for popup button clicks
    (window as any).harareValidateIncident = (id: string) => {
      onValidateIncident?.(id);
    };
    (window as any).harareRefuteIncident = (id: string) => {
      onRefuteIncident?.(id);
    };

    layerGroup.clearLayers();

    // Helper for custom HTML div icons with status indicator badge
    const createCustomIcon = (
      bgColor: string,
      symbol: string,
      pulse: boolean = false,
      verificationStatus: string = "unverified"
    ) => {
      let statusBadgeHtml = "";
      let ringStyle = "border: 2px solid #ffffff;";

      if (verificationStatus === "verified") {
        ringStyle = "border: 2.5px solid #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.5);";
        statusBadgeHtml = `
          <span style="
            position: absolute;
            top: -4px;
            right: -4px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #10b981;
            color: white;
            font-size: 10px;
            font-weight: 900;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1.5px solid #0f172a;
          ">✓</span>
        `;
      } else if (verificationStatus === "disputed") {
        ringStyle = "border: 2.5px dashed #ef4444; box-shadow: 0 0 10px rgba(239,68,68,0.5);";
        statusBadgeHtml = `
          <span style="
            position: absolute;
            top: -4px;
            right: -4px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #ef4444;
            color: white;
            font-size: 9px;
            font-weight: 900;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1.5px solid #0f172a;
          ">✕</span>
        `;
      } else {
        ringStyle = "border: 2px solid #f59e0b;";
        statusBadgeHtml = `
          <span style="
            position: absolute;
            top: -4px;
            right: -4px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #f59e0b;
            color: #0f172a;
            font-size: 10px;
            font-weight: 900;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1.5px solid #0f172a;
          ">?</span>
        `;
      }

      return L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            background: ${bgColor};
            color: white;
            border-radius: 50%;
            ${ringStyle}
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
          ">
            ${pulse ? `<span style="
              position: absolute;
              inset: -6px;
              border-radius: 50%;
              background: ${bgColor};
              opacity: 0.45;
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></span>` : ""}
            <span style="position: relative; z-index: 2;">${symbol}</span>
            ${statusBadgeHtml}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });
    };

    // 1. Incidents
    const filteredIncidents = incidents.filter((inc) => {
      const matchType = filterType === "all" || inc.type === filterType;
      const matchStatus =
        statusFilter === "all" || (inc.verificationStatus || "unverified") === statusFilter;
      return matchType && matchStatus;
    });

    filteredIncidents.forEach((inc) => {
      let color = "#f97316"; // orange
      let symbol = "⚠️";
      if (inc.type === "police") {
        color = "#3b82f6"; // blue
        symbol = "🛡️";
      } else if (inc.type === "accident") {
        color = "#ef4444"; // red
        symbol = "💥";
      } else if (inc.type === "robots_down") {
        color = "#eab308"; // yellow
        symbol = "🚥";
      } else if (inc.type === "pothole") {
        color = "#8b5cf6"; // purple
        symbol = "🕳️";
      } else if (inc.type === "hazard" || inc.type === "flooding") {
        color = "#eab308";
        symbol = "⚠️";
      }

      const vStatus = inc.verificationStatus || "unverified";

      let statusBanner = `
        <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; font-weight: 700; font-size: 10px; padding: 4px 6px; border-radius: 6px; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
          <span>🟡 UNVERIFIED REPORT</span>
          <span>${inc.upvotes} confirmations</span>
        </div>
      `;
      if (vStatus === "verified") {
        statusBanner = `
          <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-weight: 700; font-size: 10px; padding: 4px 6px; border-radius: 6px; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
            <span>🟢 VERIFIED BY MOTORISTS</span>
            <span>${inc.upvotes} confirmations</span>
          </div>
        `;
      } else if (vStatus === "disputed") {
        statusBanner = `
          <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; font-weight: 700; font-size: 10px; padding: 4px 6px; border-radius: 6px; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
            <span>🔴 DISPUTED / REFUTED</span>
            <span>${inc.refutations || 0} disputes</span>
          </div>
        `;
      }

      const marker = L.marker(inc.coords, {
        icon: createCustomIcon(
          color,
          symbol,
          inc.severity === "high" || inc.severity === "critical",
          vStatus
        ),
      });

      marker.bindPopup(`
        <div style="min-width: 230px; font-family: sans-serif; padding: 6px;">
          ${statusBanner}
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; text-transform: uppercase; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${color}20; color: ${color};">
              ${inc.type.replace("_", " ")}
            </span>
            <span style="font-size: 11px; color: #94a3b8;">${inc.timestamp}</span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #f8fafc;">${inc.title}</h4>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #cbd5e1; line-height: 1.4;">${inc.description}</p>
          <div style="font-size: 11px; color: #38bdf8; background: #0369a120; padding: 4px 6px; border-radius: 4px; margin-bottom: 8px;">
            <strong>Alternate route:</strong> ${inc.alternateRoute}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #94a3b8; margin-bottom: 8px;">
            <span>By ${inc.reportedBy} (${inc.reporterRole})</span>
          </div>
          <div style="display: flex; gap: 6px; border-top: 1px solid #334155; padding-top: 8px;">
            <button onclick="window.harareValidateIncident && window.harareValidateIncident('${inc.id}')" style="flex: 1; background: #065f46; color: #a7f3d0; border: 1px solid #059669; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
              👍 Validate (${inc.upvotes})
            </button>
            <button onclick="window.harareRefuteIncident && window.harareRefuteIncident('${inc.id}')" style="flex: 1; background: #881337; color: #fecdd3; border: 1px solid #e11d48; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
              👎 Refute (${inc.refutations || 0})
            </button>
          </div>
        </div>
      `);

      marker.on("click", () => {
        onSelectIncident(inc);
      });

      marker.addTo(layerGroup);
    });

    // 2. Kombi Ranks
    if (showRanks) {
      KOMBI_RANKS.forEach((rank) => {
        let rankCoords: [number, number] = [-17.8315, 31.0440];
        if (rank.id === "rank-1") rankCoords = [-17.8315, 31.0440]; // Copacabana
        if (rank.id === "rank-2") rankCoords = [-17.8290, 31.0560]; // 4th St
        if (rank.id === "rank-3") rankCoords = [-17.8350, 31.0410]; // Market Sq
        if (rank.id === "rank-4") rankCoords = [-17.8340, 31.0490]; // Charge Office

        const marker = L.marker(rankCoords, {
          icon: createCustomIcon("#10b981", "🚐"),
        });

        marker.bindPopup(`
          <div style="min-width: 230px; font-family: sans-serif; padding: 6px;">
            <div style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: #10b981; margin-bottom: 4px;">Kombi Terminal Hub</div>
            <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #f8fafc;">${rank.name}</h4>
            <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">${rank.location}</div>
            <div style="background: #1e293b; padding: 6px; border-radius: 6px; font-size: 11px; line-height: 1.6; color: #e2e8f0; margin-bottom: 6px;">
              <div>Status: <strong style="color: #f59e0b;">${rank.queueStatus}</strong></div>
              <div>Est. Wait: <strong>${rank.averageWaitTime}</strong></div>
              <div>Active Kombis: <strong>${rank.activeKombis}</strong></div>
              <div>Average Fare: <strong style="color: #10b981;">$${rank.currentFareUSD} / ${rank.currentFareZiG} ZiG</strong></div>
            </div>
            <div style="font-size: 11px; color: #cbd5e1;">
              Routes: ${rank.primaryRoutes.slice(0, 3).join(", ")}
            </div>
          </div>
        `);

        marker.addTo(layerGroup);
      });
    }

    // 3. Live Traffic Cameras
    if (showCameras) {
      cameras.forEach((cam) => {
        const marker = L.marker(cam.coords, {
          icon: createCustomIcon("#a855f7", "📹", true),
        });

        marker.bindPopup(`
          <div style="min-width: 220px; font-family: sans-serif; padding: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; background: #dc2626; color: white; padding: 2px 6px; border-radius: 4px;">● LIVE CAMERA</span>
              <span style="font-size: 11px; color: #94a3b8;">👁️ ${cam.viewers} watching</span>
            </div>
            <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #f8fafc;">${cam.name}</h4>
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #cbd5e1;">${cam.currentCondition}</p>
            <button id="cam-btn-${cam.id}" style="
              width: 100%;
              background: #9333ea;
              color: white;
              border: none;
              border-radius: 6px;
              padding: 6px;
              font-size: 11px;
              font-weight: 600;
              cursor: pointer;
            ">Watch Live Feed</button>
          </div>
        `);

        marker.on("popupopen", () => {
          const btn = document.getElementById(`cam-btn-${cam.id}`);
          if (btn) {
            btn.onclick = () => onSelectCamera(cam);
          }
        });

        marker.addTo(layerGroup);
      });
    }

    // 4. Rides (Drivers & Passengers)
    if (showRides) {
      rides.forEach((ride) => {
        const isDriver = ride.type === "driver_offer";
        const marker = L.marker(ride.pickupCoords, {
          icon: createCustomIcon(
            isDriver ? "#06b6d4" : "#ec4899",
            isDriver ? "🚗" : "🙋"
          ),
        });

        marker.bindPopup(`
          <div style="min-width: 220px; font-family: sans-serif; padding: 6px;">
            <div style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: ${isDriver ? "#06b6d4" : "#ec4899"}; margin-bottom: 4px;">
              ${isDriver ? "Driver Offering Ride" : "Passenger Requesting Transport"}
            </div>
            <h4 style="margin: 0 0 2px 0; font-size: 13px; font-weight: 700; color: #f8fafc;">
              ${isDriver ? ride.driverName : ride.passengerName} (★ ${ride.rating})
            </h4>
            ${isDriver && ride.vehicle ? `<div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${ride.vehicle}</div>` : ""}
            <div style="background: #1e293b; padding: 6px; border-radius: 6px; font-size: 11px; margin-bottom: 6px;">
              <div>From: <strong>${ride.pickupLocation}</strong></div>
              <div>To: <strong>${ride.destination}</strong></div>
              <div>${isDriver ? `Seats: ${ride.seatsAvailable} avail` : `Seats needed: ${ride.seatsNeeded}`}</div>
              <div>Fare: <strong style="color: #34d399;">$${isDriver ? ride.farePerSeatUSD : ride.budgetUSD} USD</strong></div>
            </div>
            <div style="font-size: 10px; color: #94a3b8;">
              Payment: ${ride.acceptedPayment.join(", ")}
            </div>
          </div>
        `);

        marker.addTo(layerGroup);
      });
    }

    // 5. On-Duty Certified Traffic Controllers
    if (showControllers && trafficControllers) {
      trafficControllers.forEach((tc) => {
        const marker = L.marker(tc.coords, {
          icon: createCustomIcon("#f59e0b", "👮‍♂️", tc.status === "on_scene"),
        });

        marker.bindPopup(`
          <div style="min-width: 230px; font-family: sans-serif; padding: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; background: #f59e0b25; color: #f59e0b; border: 1px solid #f59e0b50; padding: 2px 6px; border-radius: 4px;">
                TRAFFIC CONTROLLER
              </span>
              <span style="font-size: 10px; color: #10b981; font-weight: bold; text-transform: uppercase;">● ${tc.status.replace("_", " ")}</span>
            </div>
            <h4 style="margin: 0 0 2px 0; font-size: 13px; font-weight: 700; color: #f8fafc;">
              ${tc.name}
            </h4>
            <div style="font-size: 11px; color: #f59e0b; font-family: monospace; margin-bottom: 6px;">
              Badge #${tc.badgeNumber} • ★ ${tc.rating} (${tc.intersectionsCleared} cleared)
            </div>
            <div style="background: #1e293b; padding: 6px; border-radius: 6px; font-size: 11px; margin-bottom: 6px; color: #cbd5e1; line-height: 1.5;">
              <div>Station: <strong style="color: #f8fafc;">${tc.station}</strong></div>
              <div>Current Post: <strong>${tc.currentIntersection}</strong></div>
              <div>Vehicle: <strong style="text-transform: capitalize;">${tc.vehicleType?.replace("_", " ") || "Rapid Unit"}</strong></div>
            </div>
            <div style="display: flex; gap: 6px;">
              <a href="tel:${tc.phone}" style="flex: 1; background: #065f46; color: white; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; text-align: center; text-decoration: none;">
                📞 Call Officer
              </a>
              <button onclick="window.harareRequestControllerHere && window.harareRequestControllerHere(${tc.coords[0]}, ${tc.coords[1]}, '${tc.currentIntersection}')" style="flex: 1; background: #d97706; color: #020617; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer;">
                🚨 Request Dispatch
              </button>
            </div>
          </div>
        `);

        marker.addTo(layerGroup);
      });
    }

    // 6. Active Traffic Controller Client Rescue Missions
    if (showControllers && trafficRequests) {
      trafficRequests.filter(r => r.status !== "resolved" && r.status !== "cancelled").forEach((req) => {
        const marker = L.marker(req.coords, {
          icon: createCustomIcon("#ef4444", "🚨", true),
        });

        marker.bindPopup(`
          <div style="min-width: 230px; font-family: sans-serif; padding: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; background: #ef444425; color: #ef4444; border: 1px solid #ef444450; padding: 2px 6px; border-radius: 4px;">
                ACTIVE RESCUE MISSION
              </span>
              <span style="font-size: 10px; color: #f59e0b; font-weight: bold; text-transform: uppercase;">${req.status.replace("_", " ")}</span>
            </div>
            <h4 style="margin: 0 0 2px 0; font-size: 13px; font-weight: 700; color: #f8fafc;">
              ${req.location}
            </h4>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
              Client: <strong style="color: #f1f5f9;">${req.clientName}</strong> (${req.clientVehicle})
            </div>
            <div style="background: #1e293b; padding: 6px; border-radius: 6px; font-size: 11px; margin-bottom: 6px; color: #cbd5e1;">
              <div>Cause: <strong style="color: #fca5a5;">${req.notes || req.congestionCause}</strong></div>
              ${req.assignedController ? `<div>Officer: <strong style="color: #38bdf8;">${req.assignedController.name}</strong></div>` : ""}
              ${req.etaMinutes !== undefined ? `<div>ETA: <strong style="color: #34d399;">${req.etaMinutes === 0 ? "On Scene Directing" : `~${req.etaMinutes} mins`}</strong></div>` : ""}
            </div>
            ${req.assignedController && req.assignedController.phone ? `
              <a href="tel:${req.assignedController.phone}" style="display: block; background: #0284c7; color: white; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; text-align: center; text-decoration: none;">
                📞 Call Responding Officer
              </a>
            ` : ""}
          </div>
        `);

        marker.addTo(layerGroup);
      });
    }

    // 7. Tracked Owner Fleet Vehicle (Active Subscription or 1-Day Free Trial)
    if (trackedVehicle && trackedVehicle.reg) {
      const ownerVehicleCoords: [number, number] = [-17.8340, 31.0535]; // Active corridor along Julius Nyerere Way / Seke Rd
      const isTrial = trackedVehicle.isTrial ?? false;
      const ownerVehicleMarker = L.marker(ownerVehicleCoords, {
        icon: L.divIcon({
          className: "tracked-owner-marker",
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
              <span style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: ${isTrial ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
              <div style="width: 36px; height: 36px; border-radius: 50%; background: ${isTrial ? '#d97706' : '#059669'}; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); z-index: 10;">
                🚗
              </div>
              <div style="position: absolute; bottom: -20px; white-space: nowrap; background: #020617; border: 1.5px solid ${isTrial ? '#f59e0b' : '#10b981'}; color: #ffffff; font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 4px; font-family: monospace; box-shadow: 0 2px 5px rgba(0,0,0,0.4);">
                ${trackedVehicle.reg}
              </div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        })
      });

      ownerVehicleMarker.bindPopup(`
        <div style="min-width: 240px; font-family: sans-serif; padding: 6px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 800; background: ${isTrial ? '#f59e0b25' : '#10b98125'}; color: ${isTrial ? '#f59e0b' : '#10b981'}; border: 1px solid ${isTrial ? '#f59e0b50' : '#10b98150'}; padding: 2px 6px; border-radius: 4px;">
              ${isTrial ? '⭐ 1-DAY TRIAL FLEET VEHICLE' : '🏢 SUBSCRIBED FLEET VEHICLE'}
            </span>
            <span style="font-size: 10px; color: #10b981; font-weight: bold;">● LIVE GPS</span>
          </div>
          <h4 style="margin: 0 0 2px 0; font-size: 14px; font-weight: 800; color: #f8fafc;">
            ${trackedVehicle.reg}
          </h4>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
            Owner: <strong style="color: #f1f5f9;">${trackedVehicle.ownerName || 'Vehicle Owner'}</strong>
          </div>
          <div style="background: #1e293b; padding: 6px; border-radius: 6px; font-size: 11px; margin-bottom: 6px; color: #cbd5e1; line-height: 1.5;">
            <div>Speed: <strong style="color: #38bdf8;">42 km/h</strong> (Normal Corridor Flow)</div>
            <div>Corridor: <strong>Julius Nyerere Way ⇄ Seke Rd</strong></div>
            <div>Geofence: <strong style="color: #34d399;">Within Harare Metro Corridor</strong></div>
            ${trackedVehicle.planName ? `<div>Plan: <strong style="color: #f59e0b;">${trackedVehicle.planName}</strong></div>` : ''}
          </div>
          <div style="font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #334155; padding-top: 4px;">
            Protected by Harare Transit Escrow & Telemetry Vault
          </div>
        </div>
      `);

      ownerVehicleMarker.addTo(layerGroup);
    }
  }, [incidents, cameras, rides, trafficControllers, trafficRequests, filterType, showRanks, showCameras, showRides, showControllers, trackedVehicle]);

  // Handle Active Alternate Route Rendering
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (activeRoute && activeRoute.coordinates && activeRoute.coordinates.length > 0) {
      const isOptimal = activeRoute.condition === "optimal";
      const polyline = L.polyline(activeRoute.coordinates, {
        color: isOptimal ? "#10b981" : "#f43f5e",
        weight: 6,
        opacity: 0.9,
        dashArray: isOptimal ? undefined : "10, 8",
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      routePolylineRef.current = polyline;
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }
  }, [activeRoute]);

  // Center on Selected Incident if changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedIncident) return;
    map.setView(selectedIncident.coords, 15, { animate: true });
  }, [selectedIncident]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Overlay Quick Actions */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/70 shadow-lg">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Harare Live Radar
        </span>
        <div className="h-4 w-px bg-slate-700 mx-1"></div>
        <button
          onClick={() => mapInstanceRef.current?.setView([-17.8292, 31.0522], 14)}
          className="text-xs font-medium text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
        >
          CBD
        </button>
        <button
          onClick={() => mapInstanceRef.current?.setView([-17.8315, 31.0440], 16)}
          className="text-xs font-medium text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
        >
          Copacabana
        </button>
        <button
          onClick={() => mapInstanceRef.current?.setView([-17.8290, 31.0560], 16)}
          className="text-xs font-medium text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
        >
          4th St Rank
        </button>
        <button
          onClick={() => mapInstanceRef.current?.setView([-17.8480, 31.0590], 15)}
          className="text-xs font-medium text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
        >
          Seke Flyover
        </button>
        {onRequestControllerAtCoords && (
          <button
            onClick={() => onRequestControllerAtCoords([-17.8292, 31.0522], "Harare CBD Intersection")}
            className="text-xs font-black text-slate-950 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow transition flex items-center gap-1 cursor-pointer"
          >
            <span>🚨 Stuck? Call Controller</span>
          </button>
        )}
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[400] hidden sm:flex items-center gap-2.5 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Accident
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Police / VID
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Jam
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Robot Down
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Kombi Rank
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Rides
        </div>
        <div className="flex items-center gap-1 text-amber-400 font-bold">
          <span>👮‍♂️</span> Controller
        </div>
        <div className="flex items-center gap-1 text-rose-400 font-bold">
          <span>🚨</span> Active Rescue
        </div>
      </div>
    </div>
  );
};
