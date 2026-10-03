import { AlternateRoutePlan, RankStatus } from "../types";

export const HARARE_CENTER: [number, number] = [-17.8292, 31.0522];

export const POPULAR_LOCATIONS = [
  { name: "Copacabana Terminus (CBD)", coords: [-17.8315, 31.0440] as [number, number] },
  { name: "Fourth Street / Simon Muzenda Rank", coords: [-17.8290, 31.0560] as [number, number] },
  { name: "Market Square Rank (CBD)", coords: [-17.8350, 31.0410] as [number, number] },
  { name: "Charge Office Rank", coords: [-17.8340, 31.0490] as [number, number] },
  { name: "Joina City / Inez Terrace", coords: [-17.8320, 31.0480] as [number, number] },
  { name: "Avondale Shopping Centre (Bon Marche)", coords: [-17.8010, 31.0380] as [number, number] },
  { name: "Borrowdale (Sam Levy's Village)", coords: [-17.7550, 31.0920] as [number, number] },
  { name: "Kuwadzana Roundabout (Bulawayo Rd)", coords: [-17.8250, 30.9500] as [number, number] },
  { name: "Machipisa Shopping Centre (Highfield)", coords: [-17.8860, 30.9890] as [number, number] },
  { name: "Chitungwiza (Makoni Shopping Centre)", coords: [-18.0050, 31.0750] as [number, number] },
  { name: "Westgate Shopping Mall", coords: [-17.7780, 30.9760] as [number, number] },
  { name: "Greendale / Kamfinsa Shopping Centre", coords: [-17.8180, 31.1150] as [number, number] },
  { name: "Mabvuku / Kamunhu Shopping Centre", coords: [-17.8320, 31.1890] as [number, number] },
  { name: "Harare Showgrounds / Exhibition Park", coords: [-17.8280, 31.0250] as [number, number] },
  { name: "Robert Gabriel Mugabe International Airport", coords: [-17.9318, 31.0928] as [number, number] }
];

export const KOMBI_RANKS: RankStatus[] = [
  {
    id: "rank-1",
    name: "Copacabana Terminus",
    location: "Chinhoyi St & Speke Ave (CBD West)",
    queueStatus: "Packed / Overwhelmed",
    activeKombis: 114,
    averageWaitTime: "25 - 35 mins",
    currentFareUSD: 0.75,
    currentFareZiG: 25,
    primaryRoutes: ["Kuwadzana", "Warren Park", "Norton", "Mabelreign", "Dzivarasekwa", "Dzivaresekwa"]
  },
  {
    id: "rank-2",
    name: "Simon Muzenda (Fourth Street) Rank",
    location: "4th St & George Silundika (CBD East)",
    queueStatus: "Packed / Overwhelmed",
    activeKombis: 98,
    averageWaitTime: "30 - 45 mins",
    currentFareUSD: 1.00,
    currentFareZiG: 30,
    primaryRoutes: ["Chitungwiza (Zengeza/Seke)", "Ruwa", "Mabvuku", "Tafara", "Epworth", "Goromonzi"]
  },
  {
    id: "rank-3",
    name: "Market Square Rank",
    location: "Bank Street & Rotten Row (CBD South-West)",
    queueStatus: "Moderate",
    activeKombis: 72,
    averageWaitTime: "15 - 20 mins",
    currentFareUSD: 0.75,
    currentFareZiG: 22,
    primaryRoutes: ["Glen View", "Budiriro", "Mufakose", "Highfield", "Glen Norah"]
  },
  {
    id: "rank-4",
    name: "Charge Office Rank",
    location: "Julius Nyerere & Kenneth Kaunda",
    queueStatus: "Normal",
    activeKombis: 45,
    averageWaitTime: "10 - 15 mins",
    currentFareUSD: 0.50,
    currentFareZiG: 18,
    primaryRoutes: ["Sunningdale", "Hatfield", "Cranborne", "Arcadia", "Braeside"]
  }
];

export const PRESET_ALTERNATE_ROUTES: AlternateRoutePlan[] = [
  {
    id: "route-chit-1",
    name: "Via Airport Road & Dieppe Bypass",
    origin: "Harare CBD (4th St)",
    destination: "Chitungwiza (Makoni)",
    distanceKm: 24.5,
    durationMins: 32,
    normalDurationMins: 65,
    savedMins: 33,
    condition: "optimal",
    description: "Completely avoids the major Seke Road Flyover police checkpoint and Cripps gridlock. Smooth dual carriage up to Hatfield.",
    arteries: ["Airport Road", "Dieppe Road", "St Patrick's", "Chitungwiza Highway"],
    coordinates: [
      [-17.8290, 31.0560],
      [-17.8410, 31.0720],
      [-17.8680, 31.0850],
      [-17.9050, 31.0820],
      [-17.9500, 31.0780],
      [-18.0050, 31.0750]
    ]
  },
  {
    id: "route-chit-2",
    name: "Direct Seke Road Corridor (Congested)",
    origin: "Harare CBD (Charge Office)",
    destination: "Chitungwiza (Makoni)",
    distanceKm: 21.0,
    durationMins: 65,
    normalDurationMins: 35,
    savedMins: -30,
    condition: "congested",
    description: "Heavy congestion between Cripps Flyover and Graniteside. Police inspection active with lane merges.",
    arteries: ["Seke Road", "Graniteside", "Makoni Extension"],
    coordinates: [
      [-17.8340, 31.0490],
      [-17.8480, 31.0590],
      [-17.8800, 31.0650],
      [-17.9300, 31.0710],
      [-18.0050, 31.0750]
    ]
  },
  {
    id: "route-borr-1",
    name: "Via Second Street Extension & Churchill",
    origin: "Harare CBD (Julius Nyerere)",
    destination: "Borrowdale (Sam Levy's Village)",
    distanceKm: 12.8,
    durationMins: 18,
    normalDurationMins: 40,
    savedMins: 22,
    condition: "optimal",
    description: "Bypasses the fender bender at Borrowdale Racecourse roundabout. Fast connection through Mount Pleasant and Churchill Avenue.",
    arteries: ["2nd St Extension", "Churchill Ave", "The Chase", "Borrowdale Brooke Rd"],
    coordinates: [
      [-17.8288, 31.0480],
      [-17.8050, 31.0450],
      [-17.7820, 31.0550],
      [-17.7650, 31.0780],
      [-17.7550, 31.0920]
    ]
  },
  {
    id: "route-kuw-1",
    name: "Via Coventry Road & High Glen Link",
    origin: "Copacabana (CBD)",
    destination: "Kuwadzana Roundabout",
    distanceKm: 11.2,
    durationMins: 15,
    normalDurationMins: 35,
    savedMins: 20,
    condition: "optimal",
    description: "Avoids the non-working traffic lights at Showgrounds and Bulawayo Road potholes near National Sports Stadium.",
    arteries: ["Coventry Rd", "Workington Industrial Way", "High Glen Road"],
    coordinates: [
      [-17.8315, 31.0440],
      [-17.8390, 31.0200],
      [-17.8380, 30.9850],
      [-17.8250, 30.9500]
    ]
  }
];
