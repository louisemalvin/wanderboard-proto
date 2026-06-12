import type { Place } from "../lib/trip-types";

// ------------------------------------------------------------------
// Sample Places — curated static dataset
// 28 places across 4 cities: Tokyo, Paris, New York, Sydney
// ------------------------------------------------------------------

const tokyoPlaces: Place[] = [
  {
    id: "place-sensoji-temple",
    name: "Sensoji Temple",
    type: "attraction",
    location: { lat: 35.7148, lng: 139.7967 },
    city: "Tokyo",
    country: "Japan",
    description:
      "Tokyo's oldest temple, located in Asakusa. Famous for its Thunder Gate (Kaminarimon) and bustling Nakamise shopping street.",
    estimatedCost: { currency: "JPY", min: 0, max: 0 },
    estimatedDurationMinutes: 90,
    tags: ["culture", "history", "photo"],
    area: "Asakusa",
    notes: "Free entry. Opens at 6:00 AM. Temple grounds always accessible.",
  },
  {
    id: "place-shibuya-crossing",
    name: "Shibuya Crossing",
    type: "attraction",
    location: { lat: 35.6595, lng: 139.7004 },
    city: "Tokyo",
    country: "Japan",
    description:
      "The world's busiest pedestrian crossing, surrounded by neon billboards and department stores.",
    estimatedCost: { currency: "JPY", min: 0, max: 0 },
    estimatedDurationMinutes: 30,
    tags: ["landmark", "photo", "city"],
    area: "Shibuya",
    notes: "Best viewed from Starbucks above the crossing or from the new Shibuya Sky observation deck.",
  },
  {
    id: "place-tsukiji-outer-market",
    name: "Tsukiji Outer Market",
    type: "food",
    location: { lat: 35.6654, lng: 139.7707 },
    city: "Tokyo",
    country: "Japan",
    description:
      "Historic fish market with over 400 shops and restaurants serving fresh sushi, street food, and seafood.",
    estimatedCost: { currency: "JPY", min: 1000, max: 5000 },
    estimatedDurationMinutes: 120,
    tags: ["food", "market", "seafood"],
    area: "Tsukiji",
    notes: "Arrive early for the freshest selections. Many shops close by 2:00 PM.",
  },
  {
    id: "place-meiji-shrine",
    name: "Meiji Jingu Shrine",
    type: "nature",
    location: { lat: 35.6764, lng: 139.6993 },
    city: "Tokyo",
    country: "Japan",
    description:
      "A serene Shinto shrine dedicated to Emperor Meiji and Empress Shoken, set in a vast forested area.",
    estimatedCost: { currency: "JPY", min: 0, max: 0 },
    estimatedDurationMinutes: 60,
    tags: ["culture", "nature", "peaceful"],
    area: "Harajuku",
    notes: "Free entry. Sunrise to sunset. Visit the Inner Garden for a small fee.",
  },
  {
    id: "place-shinjuku-gyoen",
    name: "Shinjuku Gyoen National Garden",
    type: "nature",
    location: { lat: 35.6852, lng: 139.7101 },
    city: "Tokyo",
    country: "Japan",
    description:
      "A large park combining Japanese traditional, French formal, and English landscape garden styles.",
    estimatedCost: { currency: "JPY", min: 500, max: 500 },
    estimatedDurationMinutes: 90,
    tags: ["nature", "garden", "peaceful"],
    area: "Shinjuku",
    notes: "Entry fee 500 JPY. Closed Mondays. Cherry blossom hotspot in spring.",
  },
  {
    id: "place-akihabara-electric-town",
    name: "Akihabara Electric Town",
    type: "shopping",
    location: { lat: 35.7023, lng: 139.7745 },
    city: "Tokyo",
    country: "Japan",
    description:
      "Tokyo's neon-lit mecca for electronics, anime, manga, and gaming culture.",
    estimatedCost: { currency: "JPY", min: 1000, max: 10000 },
    estimatedDurationMinutes: 120,
    tags: ["shopping", "electronics", "anime", "culture"],
    area: "Akihabara",
    notes: "Shops open from 10:00 AM. Tax-free shopping available for tourists with passport.",
  },
  {
    id: "place-teamlab-borderless",
    name: "teamLab Borderless",
    type: "attraction",
    location: { lat: 35.6285, lng: 139.7845 },
    city: "Tokyo",
    country: "Japan",
    description:
      "Immersive digital art museum where light projections, mirrors, and sensors create ever-changing interactive installations.",
    estimatedCost: { currency: "JPY", min: 3200, max: 3800 },
    estimatedDurationMinutes: 120,
    tags: ["art", "immersive", "photo", "modern"],
    area: "Odaiba",
    notes: "Advance booking recommended. Tickets sell out days in advance.",
  },
  {
    id: "place-takeshita-street",
    name: "Takeshita Street",
    type: "shopping",
    location: { lat: 35.6702, lng: 139.7026 },
    city: "Tokyo",
    country: "Japan",
    description:
      "Harajuku's vibrant pedestrian street lined with quirky boutiques, crepe stands, and youth fashion stores.",
    estimatedCost: { currency: "JPY", min: 500, max: 5000 },
    estimatedDurationMinutes: 90,
    tags: ["shopping", "fashion", "food", "culture"],
    area: "Harajuku",
    notes: "Busiest on weekends. Most shops open from 11:00 AM. Try a crepe from one of the famous stands.",
  },
  {
    id: "place-roppongi-hills",
    name: "Roppongi Hills",
    type: "area",
    location: { lat: 35.6604, lng: 139.7292 },
    city: "Tokyo",
    country: "Japan",
    description:
      "Modern urban complex with an observation deck, Mori Art Museum, designer shops, and restaurants.",
    estimatedCost: { currency: "JPY", min: 2000, max: 5000 },
    estimatedDurationMinutes: 120,
    tags: ["view", "art", "shopping", "modern"],
    area: "Roppongi",
    notes: "Tokyo City View observation deck open until late. Mori Art Museum has rotating exhibitions.",
  },
  {
    id: "place-golden-gai",
    name: "Golden Gai",
    type: "area",
    location: { lat: 35.6938, lng: 139.7036 },
    city: "Tokyo",
    country: "Japan",
    description:
      "Iconic neighborhood of narrow alleys packed with tiny bars, each seating only a handful of patrons.",
    estimatedCost: { currency: "JPY", min: 3000, max: 8000 },
    estimatedDurationMinutes: 120,
    tags: ["nightlife", "food", "culture", "hidden"],
    area: "Shinjuku",
    notes: "Best visited after 8:00 PM. Many bars charge a cover fee (~¥500-¥1000). Cash only at most places.",
  },
];

const parisPlaces: Place[] = [
  {
    id: "place-eiffel-tower",
    name: "Eiffel Tower",
    type: "attraction",
    location: { lat: 48.8584, lng: 2.2945 },
    city: "Paris",
    country: "France",
    description:
      "Icon 19th-century iron lattice tower on the Champ de Mars, offering panoramic views of Paris.",
    estimatedCost: { currency: "EUR", min: 11, max: 29 },
    estimatedDurationMinutes: 120,
    tags: ["landmark", "history", "view"],
    area: "7th Arrondissement",
    notes: "Book tickets online in advance to avoid long queues. The summit has the best views.",
  },
  {
    id: "place-louvre-museum",
    name: "Louvre Museum",
    type: "attraction",
    location: { lat: 48.8606, lng: 2.3376 },
    city: "Paris",
    country: "France",
    description:
      "World's largest art museum and a historic monument, housing the Mona Lisa and thousands of masterpieces.",
    estimatedCost: { currency: "EUR", min: 17, max: 22 },
    estimatedDurationMinutes: 180,
    tags: ["art", "history", "museum", "culture"],
    area: "1st Arrondissement",
    notes: "Closed Tuesdays. Free for EU under-26. Hourly timed entry slots required.",
  },
  {
    id: "place-montmartre",
    name: "Montmartre",
    type: "area",
    location: { lat: 48.8867, lng: 2.3431 },
    city: "Paris",
    country: "France",
    description:
      "Historic hilltop neighborhood known for Sacre-Coeur Basilica, artist studios, and bohemian cafes.",
    estimatedCost: { currency: "EUR", min: 0, max: 0 },
    estimatedDurationMinutes: 150,
    tags: ["neighborhood", "art", "photo", "culture"],
    area: "Montmartre",
    notes: "Free to explore. Funicular or stairs up to Sacre-Coeur. Watch for pickpockets near the basilica.",
  },
  {
    id: "place-le-marais",
    name: "Le Marais",
    type: "area",
    location: { lat: 48.8594, lng: 2.3618 },
    city: "Paris",
    country: "France",
    description:
      "Trendy neighborhood with narrow medieval streets, chic boutiques, art galleries, and Jewish bakeries.",
    estimatedCost: { currency: "EUR", min: 0, max: 0 },
    estimatedDurationMinutes: 120,
    tags: ["shopping", "food", "history", "neighborhood"],
    area: "4th Arrondissement",
    notes: "Great for walking. Many museums in the area including Picasso Museum. Sundays are lively.",
  },
  {
    id: "place-cafe-de-flore",
    name: "Cafe de Flore",
    type: "cafe",
    location: { lat: 48.8540, lng: 2.3324 },
    city: "Paris",
    country: "France",
    description:
      "Legendary Saint-Germain-des-Pres cafe associated with intellectuals like Sartre and de Beauvoir.",
    estimatedCost: { currency: "EUR", min: 8, max: 25 },
    estimatedDurationMinutes: 60,
    tags: ["cafe", "history", "culture"],
    area: "Saint-Germain-des-Pres",
    notes: "Famous but touristy. Expect higher prices for the ambience and history.",
  },
  {
    id: "place-musee-dorsay",
    name: "Musee d'Orsay",
    type: "attraction",
    location: { lat: 48.8600, lng: 2.3266 },
    city: "Paris",
    country: "France",
    description:
      "Stunning museum housed in a former railway station, featuring the world's largest collection of Impressionist art.",
    estimatedCost: { currency: "EUR", min: 16, max: 16 },
    estimatedDurationMinutes: 150,
    tags: ["art", "museum", "history", "impressionist"],
    area: "7th Arrondissement",
    notes: "Closed Mondays. Free first Sunday of the month. The clock view is a must-photo.",
  },
];

const newYorkPlaces: Place[] = [
  {
    id: "place-central-park",
    name: "Central Park",
    type: "nature",
    location: { lat: 40.7829, lng: -73.9654 },
    city: "New York",
    country: "USA",
    description:
      "Iconic 843-acre urban park with meadows, lakes, trails, and landmarks like Bethesda Fountain and Bow Bridge.",
    estimatedCost: { currency: "USD", min: 0, max: 0 },
    estimatedDurationMinutes: 120,
    tags: ["nature", "walking", "landmark", "photo"],
    area: "Manhattan",
    notes: "Free entry. Horse-drawn carriage rides available. Rent bikes at multiple entrances.",
  },
  {
    id: "place-times-square",
    name: "Times Square",
    type: "attraction",
    location: { lat: 40.7580, lng: -73.9855 },
    city: "New York",
    country: "USA",
    description:
      "Dazzling commercial intersection known for its bright billboards, Broadway theaters, and non-stop energy.",
    estimatedCost: { currency: "USD", min: 0, max: 0 },
    estimatedDurationMinutes: 45,
    tags: ["landmark", "city", "photo", "entertainment"],
    area: "Midtown Manhattan",
    notes: "Best visited at night when the lights are brightest. Extremely crowded at all hours.",
  },
  {
    id: "place-brooklyn-bridge",
    name: "Brooklyn Bridge",
    type: "attraction",
    location: { lat: 40.7061, lng: -73.9969 },
    city: "New York",
    country: "USA",
    description:
      "Historic hybrid cable-stayed suspension bridge connecting Manhattan and Brooklyn with a scenic pedestrian walkway.",
    estimatedCost: { currency: "USD", min: 0, max: 0 },
    estimatedDurationMinutes: 60,
    tags: ["landmark", "walking", "view", "history"],
    area: "Lower Manhattan / DUMBO",
    notes: "Free to walk. Best at sunrise or sunset. The walk is about 1.1 miles one way.",
  },
  {
    id: "place-metropolitan-museum",
    name: "Metropolitan Museum of Art",
    type: "attraction",
    location: { lat: 40.7794, lng: -73.9632 },
    city: "New York",
    country: "USA",
    description:
      "One of the world's largest and finest art museums, with over 5,000 years of art from across the globe.",
    estimatedCost: { currency: "USD", min: 25, max: 30 },
    estimatedDurationMinutes: 180,
    tags: ["art", "museum", "history", "culture"],
    area: "Upper East Side",
    notes: "Pay-what-you-wish for NY residents. Closed Wednesdays. Allow at least 3 hours.",
  },
  {
    id: "place-dominique-anson",
    name: "Dominique Ansel Bakery",
    type: "food",
    location: { lat: 40.7248, lng: -74.0007 },
    city: "New York",
    country: "USA",
    description:
      "Home of the original Cronut (croissant-donut hybrid) and other creative pastries in SoHo.",
    estimatedCost: { currency: "USD", min: 8, max: 20 },
    estimatedDurationMinutes: 30,
    tags: ["food", "dessert", "bakery"],
    area: "SoHo",
    notes: "Famous for long queues. Arrive before opening for the best chance at a Cronut.",
  },
  {
    id: "place-high-line",
    name: "The High Line",
    type: "nature",
    location: { lat: 40.7480, lng: -74.0048 },
    city: "New York",
    country: "USA",
    description:
      "A 1.45-mile elevated linear park built on a historic freight rail line, with gardens, art installations, and city views.",
    estimatedCost: { currency: "USD", min: 0, max: 0 },
    estimatedDurationMinutes: 60,
    tags: ["nature", "walking", "art", "garden"],
    area: "Chelsea / Meatpacking District",
    notes: "Free entry. Open 7:00 AM – 10:00 PM. Accessible entrances at multiple points along the route.",
  },
];

const sydneyPlaces: Place[] = [
  {
    id: "place-sydney-opera-house",
    name: "Sydney Opera House",
    type: "attraction",
    location: { lat: -33.8568, lng: 151.2153 },
    city: "Sydney",
    country: "Australia",
    description:
      "UNESCO-listed performing arts center with its distinctive sail-shaped design on Bennelong Point.",
    estimatedCost: { currency: "AUD", min: 0, max: 43 },
    estimatedDurationMinutes: 90,
    tags: ["landmark", "culture", "architecture", "photo"],
    area: "Bennelong Point",
    notes: "Guided tours available. Free outdoor areas. Sunset views from the forecourt are spectacular.",
  },
  {
    id: "place-bondi-beach",
    name: "Bondi Beach",
    type: "nature",
    location: { lat: -33.8915, lng: 151.2767 },
    city: "Sydney",
    country: "Australia",
    description:
      "World-famous golden-sand beach with surf culture, coastal walks, cafes, and an ocean pool.",
    estimatedCost: { currency: "AUD", min: 0, max: 0 },
    estimatedDurationMinutes: 120,
    tags: ["beach", "surf", "nature", "walking"],
    area: "Bondi",
    notes: "Free entry. Lifeguards on duty. The Bondi to Coogee coastal walk takes about 2 hours.",
  },
  {
    id: "place-sydney-harbour-bridge",
    name: "Sydney Harbour Bridge",
    type: "attraction",
    location: { lat: -33.8523, lng: 151.2108 },
    city: "Sydney",
    country: "Australia",
    description:
      "Heritage-listed steel arch bridge nicknamed 'The Coathanger', with panoramic views from its bridge climb.",
    estimatedCost: { currency: "AUD", min: 0, max: 0 },
    estimatedDurationMinutes: 60,
    tags: ["landmark", "view", "walking", "photo"],
    area: "The Rocks",
    notes: "Bridge climb is paid (~AUD 200+). Walking across the pedestrian path is free.",
  },
  {
    id: "place-rocks-district",
    name: "The Rocks",
    type: "area",
    location: { lat: -33.8599, lng: 151.2090 },
    city: "Sydney",
    country: "Australia",
    description:
      "Historic neighborhood with cobblestone streets, weekend markets, pubs, and colonial-era buildings.",
    estimatedCost: { currency: "AUD", min: 0, max: 0 },
    estimatedDurationMinutes: 90,
    tags: ["history", "neighborhood", "food", "shopping"],
    area: "The Rocks",
    notes: "Weekend markets run Saturday and Sunday. Great spot for souvenirs and historic pub lunches.",
  },
  {
    id: "place-royal-botanic-garden",
    name: "Royal Botanic Garden",
    type: "nature",
    location: { lat: -33.8642, lng: 151.2166 },
    city: "Sydney",
    country: "Australia",
    description:
      "A 30-hectare botanical garden on Sydney Harbour offering stunning views of the Opera House and Harbour Bridge.",
    estimatedCost: { currency: "AUD", min: 0, max: 0 },
    estimatedDurationMinutes: 90,
    tags: ["nature", "garden", "view", "peaceful"],
    area: "Sydney CBD",
    notes: "Free entry. Open daily 7:00 AM – 5:00 PM. Guided walks available.",
  },
  {
    id: "place-fish-market",
    name: "Sydney Fish Market",
    type: "food",
    location: { lat: -33.8702, lng: 151.1982 },
    city: "Sydney",
    country: "Australia",
    description:
      "Southern Hemisphere's largest seafood market, with fresh catches, oyster bars, and cooking classes.",
    estimatedCost: { currency: "AUD", min: 15, max: 50 },
    estimatedDurationMinutes: 90,
    tags: ["food", "market", "seafood"],
    area: "Pyrmont",
    notes: "Arrive by noon for the best selection. The seafood platter at Christies is a must-try.",
  },
];

// ------------------------------------------------------------------
// Combined export
// ------------------------------------------------------------------

export const samplePlaces: Place[] = [
  ...tokyoPlaces,
  ...parisPlaces,
  ...newYorkPlaces,
  ...sydneyPlaces,
];

// ------------------------------------------------------------------
// Helper: filter places by city
// ------------------------------------------------------------------

export function getPlacesByCity(city: string): Place[] {
  return samplePlaces.filter(
    (place) => place.city.toLowerCase() === city.toLowerCase()
  );
}
