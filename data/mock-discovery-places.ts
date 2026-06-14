// ------------------------------------------------------------------
// Mock discovery places for the Map & Discovery screen
// Tokyo places aligned with the deterministic sample trip
// ------------------------------------------------------------------

export interface DiscoveryPlace {
  id: string;
  name: string;
  type: "attraction" | "food" | "nature" | "shopping" | "area";
  city: string;
  lat: number;
  lng: number;
  description: string;
  isBookmarked: boolean;
}

export const discoveryPlaces: DiscoveryPlace[] = [
  {
    id: "place-sensoji-temple",
    name: "Sensoji Temple",
    type: "attraction",
    city: "Tokyo",
    lat: 35.7148,
    lng: 139.7967,
    description:
      "Tokyo's oldest temple in Asakusa, with Kaminarimon Gate and Nakamise shopping street.",
    isBookmarked: false,
  },
  {
    id: "place-shibuya-crossing",
    name: "Shibuya Crossing",
    type: "attraction",
    city: "Tokyo",
    lat: 35.6595,
    lng: 139.7004,
    description:
      "The world's busiest pedestrian crossing, surrounded by shops, screens, and observation points.",
    isBookmarked: false,
  },
  {
    id: "place-tsukiji-outer-market",
    name: "Tsukiji Outer Market",
    type: "food",
    city: "Tokyo",
    lat: 35.6654,
    lng: 139.7707,
    description:
      "Historic food market with sushi counters, seafood stalls, snacks, and morning market energy.",
    isBookmarked: false,
  },
  {
    id: "place-meiji-shrine",
    name: "Meiji Jingu Shrine",
    type: "nature",
    city: "Tokyo",
    lat: 35.6764,
    lng: 139.6993,
    description:
      "A calm Shinto shrine set in a forested area near Harajuku and Yoyogi Park.",
    isBookmarked: false,
  },
  {
    id: "place-shinjuku-gyoen",
    name: "Shinjuku Gyoen National Garden",
    type: "nature",
    city: "Tokyo",
    lat: 35.6852,
    lng: 139.7101,
    description:
      "A large garden with Japanese, French, and English landscape areas in central Shinjuku.",
    isBookmarked: false,
  },
  {
    id: "place-akihabara-electric-town",
    name: "Akihabara Electric Town",
    type: "shopping",
    city: "Tokyo",
    lat: 35.7023,
    lng: 139.7745,
    description:
      "Tokyo's electronics, anime, manga, and gaming district with dense specialty shopping.",
    isBookmarked: false,
  },
  {
    id: "place-ueno-park",
    name: "Ueno Park",
    type: "nature",
    city: "Tokyo",
    lat: 35.7156,
    lng: 139.7745,
    description:
      "A broad city park with museums, ponds, temples, and seasonal cherry blossoms near Ueno Station.",
    isBookmarked: false,
  },
  {
    id: "place-tokyo-national-museum",
    name: "Tokyo National Museum",
    type: "attraction",
    city: "Tokyo",
    lat: 35.7188,
    lng: 139.7765,
    description:
      "Japan's oldest national museum, known for art, armor, ceramics, and cultural artifacts.",
    isBookmarked: false,
  },
  {
    id: "place-ginza",
    name: "Ginza",
    type: "shopping",
    city: "Tokyo",
    lat: 35.6719,
    lng: 139.7658,
    description:
      "An elegant shopping district with department stores, design boutiques, galleries, and polished dining.",
    isBookmarked: false,
  },
  {
    id: "place-omotesando",
    name: "Omotesando",
    type: "shopping",
    city: "Tokyo",
    lat: 35.6652,
    lng: 139.7126,
    description:
      "A tree-lined avenue for architecture, fashion, cafes, and a calmer walk between Harajuku and Aoyama.",
    isBookmarked: false,
  },
  {
    id: "place-yoyogi-park",
    name: "Yoyogi Park",
    type: "nature",
    city: "Tokyo",
    lat: 35.6717,
    lng: 139.6949,
    description:
      "A spacious public park beside Harajuku, useful for an easy break between busy neighborhoods.",
    isBookmarked: false,
  },
  {
    id: "place-tokyo-tower",
    name: "Tokyo Tower",
    type: "attraction",
    city: "Tokyo",
    lat: 35.6586,
    lng: 139.7454,
    description:
      "A classic orange-and-white observation tower with city views and a strong old-Tokyo landmark feel.",
    isBookmarked: false,
  },
  {
    id: "place-roppongi-hills",
    name: "Roppongi Hills",
    type: "area",
    city: "Tokyo",
    lat: 35.6605,
    lng: 139.7292,
    description:
      "A compact district for contemporary art, observation views, restaurants, shops, and evening options.",
    isBookmarked: false,
  },
  {
    id: "place-teamlab-borderless",
    name: "teamLab Borderless",
    type: "attraction",
    city: "Tokyo",
    lat: 35.6665,
    lng: 139.7321,
    description:
      "An immersive digital art museum with room-scale light installations and timed-entry planning needs.",
    isBookmarked: false,
  },
  {
    id: "place-nakameguro",
    name: "Nakameguro",
    type: "area",
    city: "Tokyo",
    lat: 35.6444,
    lng: 139.6992,
    description:
      "A relaxed canal-side neighborhood with boutiques, coffee shops, dinner spots, and evening walks.",
    isBookmarked: false,
  },
  {
    id: "place-daikanyama-t-site",
    name: "Daikanyama T-Site",
    type: "shopping",
    city: "Tokyo",
    lat: 35.6492,
    lng: 139.6995,
    description:
      "A refined bookstore and lifestyle complex surrounded by cafes and quiet neighborhood streets.",
    isBookmarked: false,
  },
  {
    id: "place-yanaka-ginza",
    name: "Yanaka Ginza",
    type: "area",
    city: "Tokyo",
    lat: 35.7273,
    lng: 139.7657,
    description:
      "A nostalgic shopping street with snacks, small shops, and a slower neighborhood pace.",
    isBookmarked: false,
  },
  {
    id: "place-ameya-yokocho",
    name: "Ameya-Yokocho Market",
    type: "food",
    city: "Tokyo",
    lat: 35.7101,
    lng: 139.7747,
    description:
      "A busy market lane near Ueno with street food, seafood stalls, discount shops, and casual energy.",
    isBookmarked: false,
  },
  {
    id: "place-kappabashi-street",
    name: "Kappabashi Street",
    type: "shopping",
    city: "Tokyo",
    lat: 35.7118,
    lng: 139.7892,
    description:
      "A kitchenware street popular for ceramics, knives, plastic food models, and practical souvenirs.",
    isBookmarked: false,
  },
  {
    id: "place-odaiba-seaside-park",
    name: "Odaiba Seaside Park",
    type: "nature",
    city: "Tokyo",
    lat: 35.6299,
    lng: 139.7767,
    description:
      "A waterfront park with bay views, open paths, and a slower contrast to central Tokyo neighborhoods.",
    isBookmarked: false,
  },
  {
    id: "place-toyosu-market",
    name: "Toyosu Market",
    type: "food",
    city: "Tokyo",
    lat: 35.6432,
    lng: 139.7849,
    description:
      "Tokyo's modern wholesale market with sushi restaurants, observation areas, and early-morning timing.",
    isBookmarked: false,
  },
  {
    id: "place-kichijoji-harmonica-yokocho",
    name: "Harmonica Yokocho",
    type: "food",
    city: "Tokyo",
    lat: 35.7032,
    lng: 139.5795,
    description:
      "A narrow-lane dining area in Kichijoji with tiny bars, casual food stalls, and local atmosphere.",
    isBookmarked: false,
  },
  {
    id: "place-inokashira-park",
    name: "Inokashira Park",
    type: "nature",
    city: "Tokyo",
    lat: 35.7001,
    lng: 139.5743,
    description:
      "A leafy park with a pond, boats, walking paths, and an easy pairing with Kichijoji.",
    isBookmarked: false,
  },
  {
    id: "place-tokyo-station-marunouchi",
    name: "Tokyo Station Marunouchi",
    type: "area",
    city: "Tokyo",
    lat: 35.6812,
    lng: 139.7671,
    description:
      "A polished station district with restored brick architecture, underground food halls, and easy transit.",
    isBookmarked: false,
  },
];

export type FilterChipDef = {
  id: string;
  label: string;
  type: "all" | DiscoveryPlace["type"];
};

export const filterChips: FilterChipDef[] = [
  { id: "all", label: "All", type: "all" },
  { id: "attractions", label: "Attractions", type: "attraction" },
  { id: "food-drink", label: "Food & drink", type: "food" },
  { id: "nature", label: "Nature", type: "nature" },
  { id: "shopping", label: "Shopping", type: "shopping" },
];
