// ------------------------------------------------------------------
// Knowledge Document Types and Index
// ------------------------------------------------------------------

export type TravelKnowledgeCategory =
  | "neighbourhood"
  | "pacing"
  | "transport"
  | "practical"
  | "accessibility"
  | "etiquette";

export type TravelKnowledgeDocument = {
  id: string;
  title: string;
  destination: string;
  category: TravelKnowledgeCategory;
  content: string;
  sourceTitle: string;
  sourceUrl?: string;
  lastReviewed: string;
};

export const TOKYO_KNOWLEDGE_DOCUMENTS: TravelKnowledgeDocument[] = [
  // -- Neighbourhoods --
  {
    id: "tokyo-asakusa",
    title: "Asakusa Neighbourhood",
    destination: "Tokyo",
    category: "neighbourhood",
    content:
      "Asakusa is a traditional district centred on Sensoji Temple, Tokyo's oldest Buddhist temple. Nakamise-dori shopping street leads from Kaminarimon Gate to the temple. Nearby Sumida River offers river cruises and seasonal views. Pairs naturally with Ueno (museums, park), Ryogoku (sumo culture), or a leisurely Sumida River walk.",
    sourceTitle: "Japan National Tourism Organization — Tokyo Guide",
    sourceUrl: "https://www.japan.travel/en/destinations/kanto/tokyo/",
    lastReviewed: "2026-04",
  },
  {
    id: "tokyo-ueno",
    title: "Ueno Neighbourhood",
    destination: "Tokyo",
    category: "neighbourhood",
    content:
      "Ueno Park houses several major museums including the Tokyo National Museum and National Museum of Western Art, plus Ueno Zoo. Shinobazu Pond offers seasonal lotus views. Good neighbour pairing with Asakusa, Akihabara, or Yanaka. Connected to Narita Airport via Keisei Skyliner.",
    sourceTitle: "Japan National Tourism Organization — Tokyo Guide",
    sourceUrl: "https://www.japan.travel/en/destinations/kanto/tokyo/",
    lastReviewed: "2026-04",
  },
  {
    id: "tokyo-shibuya",
    title: "Shibuya Neighbourhood",
    destination: "Tokyo",
    category: "neighbourhood",
    content:
      "Shibuya is famous for Shibuya Crossing, one of the busiest pedestrian intersections globally, plus the Hachiko Statue and Shibuya Sky observation deck. Extensive shopping including Shibuya 109, Seibu, and Parco. Connects easily to Harajuku via Cat Street (walkable, ~20 minutes). Relaxed pace: pair Shibuya + Harajuku. Packed pace: Shibuya + Harajuku + Shinjuku.",
    sourceTitle: "Japan National Tourism Organization — Tokyo Guide",
    sourceUrl: "https://www.japan.travel/en/destinations/kanto/tokyo/",
    lastReviewed: "2026-04",
  },
  {
    id: "tokyo-harajuku",
    title: "Harajuku Neighbourhood",
    destination: "Tokyo",
    category: "neighbourhood",
    content:
      "Harajuku features Takeshita Street for youth culture, crepe shops, and quirky fashion. Omotesando offers upscale shopping and architecture. Meiji Shrine, a large Shinto shrine in a forested park, provides a quiet contrast. Walkable from Shibuya in roughly 20 minutes via Cat Street.",
    sourceTitle: "Japan National Tourism Organization — Tokyo Guide",
    sourceUrl: "https://www.japan.travel/en/destinations/kanto/tokyo/",
    lastReviewed: "2026-04",
  },
  {
    id: "tokyo-shinjuku",
    title: "Shinjuku Neighbourhood",
    destination: "Tokyo",
    category: "neighbourhood",
    content:
      "Shinjuku has the busiest train station in the world. Shinjuku Gyoen National Garden is a large landscape garden with three styles. Golden Gai offers tiny themed bars, and Omoide Yokocho is a yakitori alley. The Tokyo Metropolitan Government Building offers free observation decks. Exercise caution in the Kabukicho entertainment district late at night.",
    sourceTitle: "Japan National Tourism Organization — Tokyo Guide",
    sourceUrl: "https://www.japan.travel/en/destinations/kanto/tokyo/",
    lastReviewed: "2026-04",
  },
  {
    id: "tokyo-tsukiji",
    title: "Tsukiji Outer Market",
    destination: "Tokyo",
    category: "neighbourhood",
    content:
      "Tsukiji Outer Market remains vibrant with food stalls and fresh seafood. Most shops close by early afternoon — plan for morning visits. Nearby attractions include Hamarikyu Gardens, Ginza high-end shopping, and Tsukiji Honganji Temple.",
    sourceTitle: "Japan National Tourism Organization — Tokyo Guide",
    sourceUrl: "https://www.japan.travel/en/destinations/kanto/tokyo/",
    lastReviewed: "2026-04",
  },
  {
    id: "tokyo-akihabara",
    title: "Akihabara Electric Town",
    destination: "Tokyo",
    category: "neighbourhood",
    content:
      "Akihabara is the hub for electronics, anime, manga, and gaming culture. Large electronics retailers include Yodobashi Camera. The area can be overwhelming on weekends due to pedestrian crowds. Pairs well with Ueno or Asakusa on the same day.",
    sourceTitle: "Japan National Tourism Organization — Tokyo Guide",
    sourceUrl: "https://www.japan.travel/en/destinations/kanto/tokyo/",
    lastReviewed: "2026-04",
  },
  {
    id: "tokyo-roppongi",
    title: "Roppongi Area",
    destination: "Tokyo",
    category: "neighbourhood",
    content:
      "Roppongi Hills complex includes the Mori Art Museum and Tokyo City View observation deck. The area offers nightlife and international dining. Nearby: Tokyo Tower, Azabudai Hills, and teamLab Borderless (located in Azabudai).",
    sourceTitle: "Japan National Tourism Organization — Tokyo Guide",
    sourceUrl: "https://www.japan.travel/en/destinations/kanto/tokyo/",
    lastReviewed: "2026-04",
  },

  // -- Pacing --
  {
    id: "tokyo-pacing-relaxed",
    title: "Relaxed Pace Strategy for Tokyo",
    destination: "Tokyo",
    category: "pacing",
    content:
      "For a relaxed pace (2-3 major stops per day), allow 2-3 hours per major neighbourhood plus travel time. Pair one major attraction with a leisurely meal, garden visit, or shopping stroll. Avoid scheduling more than two areas requiring a train transfer. Example: Meiji Shrine (morning) + Harajuku Takeshita (afternoon) + Omotesando dinner.",
    sourceTitle: "Wikivoyage — Tokyo",
    sourceUrl: "https://en.wikivoyage.org/wiki/Tokyo",
    lastReviewed: "2026-04",
  },
  {
    id: "tokyo-pacing-balanced",
    title: "Balanced Pace Strategy for Tokyo",
    destination: "Tokyo",
    category: "pacing",
    content:
      "For a balanced pace (3-4 stops per day), group 2-3 neighbourhoods that share a train line or are walkable. Allow 1.5-2 hours per stop with buffer for transit and meals. Shinjuku to Shibuya is about 7 minutes on JR Yamanote. Example balanced day: Tsukiji Outer Market (morning) + Akihabara (midday) + Asakusa (afternoon).",
    sourceTitle: "Wikivoyage — Tokyo",
    sourceUrl: "https://en.wikivoyage.org/wiki/Tokyo",
    lastReviewed: "2026-04",
  },
  {
    id: "tokyo-pacing-packed",
    title: "Packed Pace Strategy for Tokyo",
    destination: "Tokyo",
    category: "pacing",
    content:
      "A packed pace (5+ stops per day) is feasible for energetic travellers planning pre-dawn to late evening. Limit geographic spread: stay within 2-3 adjacent wards. Example packed Shibuya+Harajuku+Shinjuku day: Meiji Shrine (8am) to Takeshita Street (10am) to Shibuya Crossing (1pm lunch) to Shinjuku Gyoen (3pm) to Golden Gai (evening). Warning: packed days leave little room for spontaneous discoveries or rest.",
    sourceTitle: "Wikivoyage — Tokyo",
    sourceUrl: "https://en.wikivoyage.org/wiki/Tokyo",
    lastReviewed: "2026-04",
  },

  // -- Transport --
  {
    id: "tokyo-transport-trains",
    title: "Tokyo Train Network",
    destination: "Tokyo",
    category: "transport",
    content:
      "The JR Yamanote Line (loop line) connects Shinjuku, Shibuya, Harajuku, Ueno, Tokyo Station, and more. Tokyo Metro and Toei Subway cover most central areas. A 24/48/72-hour tourist pass can be cost-effective. Suica or Pasmo IC cards work across nearly all trains, buses, and convenience stores. Avoid commuter peak hours (roughly 7:30-9:00 and 17:30-19:00) with luggage.",
    sourceTitle: "Tokyo Metro — Tourist Information",
    sourceUrl: "https://www.tokyometro.jp/en/ticket/travel/index.html",
    lastReviewed: "2026-04",
  },
  {
    id: "tokyo-transport-airports",
    title: "Tokyo Airport Access",
    destination: "Tokyo",
    category: "transport",
    content:
      "Haneda Airport (HND) is closer to the city centre (roughly 30-40 minutes by train). Narita Airport (NRT) is further (roughly 60-90 minutes by Narita Express). Taxis are clean and safe but expensive; use for short hops or late-night returns. The Keisei Skyliner connects Narita to Ueno in about 41 minutes.",
    sourceTitle: "JR East — Train Information for Tokyo Area",
    sourceUrl: "https://www.jreast.co.jp/e/",
    lastReviewed: "2026-04",
  },

  // -- Practical --
  {
    id: "tokyo-practical-cash",
    title: "Cash Considerations in Tokyo",
    destination: "Tokyo",
    category: "practical",
    content:
      "Many small restaurants and shops remain cash-only in Tokyo. Carry yen for local markets, smaller eateries, and temple offerings. Convenience stores and larger chains typically accept cards and IC payments. 7-Eleven ATMs reliably accept international cards.",
    sourceTitle: "Wikivoyage — Tokyo",
    sourceUrl: "https://en.wikivoyage.org/wiki/Tokyo",
    lastReviewed: "2026-04",
  },
  {
    id: "tokyo-practical-check-before",
    title: "Check-Before-You-Go Guidelines",
    destination: "Tokyo",
    category: "practical",
    content:
      "Opening hours for small restaurants and shops vary significantly and may not be updated online. teamLab Borderless and other popular attractions require advance online booking; walk-in availability is rare. Seasonal closures occur around New Year (late December to early January). Gardens have reduced appeal in winter. Summer (June-August) is hot and humid. Cherry blossom season (late March-early April) is peak tourist time.",
    sourceTitle: "teamLab Borderless — Official Website",
    sourceUrl: "https://www.teamlab.art/e/borderless-azabudai/",
    lastReviewed: "2026-04",
  },
  {
    id: "tokyo-practical-daytrips",
    title: "Day Trips from Tokyo",
    destination: "Tokyo",
    category: "practical",
    content:
      "Kamakura offers temples, the Great Buddha, and beach access, roughly 1 hour by JR Yokosuka Line. Yokohama features Minato Mirai, Chinatown, and the Cup Noodles Museum, about 30 minutes from Tokyo. Nikko has Toshogu Shrine and nature, roughly 2 hours by limited express. Hakone offers hot springs and Mount Fuji views, about 1.5 hours by Romancecar. The Japan Rail Pass must be purchased outside Japan before arrival.",
    sourceTitle: "Japan National Tourism Organization — Tokyo Guide",
    sourceUrl: "https://www.japan.travel/en/destinations/kanto/tokyo/",
    lastReviewed: "2026-04",
  },

  // -- Accessibility --
  {
    id: "tokyo-accessibility-general",
    title: "Tokyo Accessibility Overview",
    destination: "Tokyo",
    category: "accessibility",
    content:
      "Major stations and newer attractions are increasingly barrier-free with elevators and ramps. Older neighbourhoods (Asakusa side streets, Golden Gai) may have narrow paths and stairs. Wheelchair-accessible taxis (Universal Design taxis) are available and should be booked in advance or via apps. Many train stations have tactile paving and staff assistance available.",
    sourceTitle: "Accessible Japan — Tokyo Accessibility Guide",
    sourceUrl: "https://www.accessible-japan.com/",
    lastReviewed: "2026-03",
  },

  // -- Etiquette --
  {
    id: "tokyo-etiquette-general",
    title: "Tokyo Etiquette Essentials",
    destination: "Tokyo",
    category: "etiquette",
    content:
      "Walking while eating is uncommon outside market areas — stand or sit to finish food. On trains, keep phone calls minimal and set phones to silent mode (manner mode). Queue orderly for trains and stand on the left side of escalators in Tokyo. Tipping is not practiced and may cause awkwardness. Remove shoes when entering certain restaurants, traditional accommodations, and some temples. Tattoos may restrict entry to some public baths, onsen, pools, and gyms.",
    sourceTitle: "Japan National Tourism Organization — Tokyo Guide",
    sourceUrl: "https://www.japan.travel/en/destinations/kanto/tokyo/",
    lastReviewed: "2026-04",
  },
  {
    id: "tokyo-disclaimer",
    title: "Travel Knowledge Disclaimer",
    destination: "Tokyo",
    category: "practical",
    content:
      "This knowledge was curated from publicly available travel resources and personal experience. All information is approximate. Opening hours, prices, access details, and seasonal conditions must be verified through official sources before travelling. This content is intended for hackathon demonstration purposes and covers only the Tokyo area within a limited scope.",
    sourceTitle: "Wanderboard — Curated Knowledge Set",
    lastReviewed: "2026-06",
  },
];
