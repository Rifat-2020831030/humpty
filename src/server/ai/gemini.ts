import { DHAKA_CENTER } from "../../lib/constants";

export interface DhakaLandmark {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  aliases?: string[];
}

export interface AiLocationResult {
  lat: number;
  lng: number;
  displayName: string;
  confidence: number;
  warning?: string;
  isFallback?: boolean;
}

export const DHAKA_LANDMARKS: DhakaLandmark[] = [
  {
    name: "Mohakhali",
    displayName: "Mohakhali, Dhaka",
    lat: 23.778363865941,
    lng: 90.39804578897022,
    aliases: [
      "mohakhali",
      "mahakhali",
      "mohakhali flyover",
      "wireless gate",
      "amtoli",
      "icddrb",
      "raowa club",
    ],
  },
  {
    name: "Mohakhali DOHS",
    displayName: "Mohakhali DOHS, Dhaka",
    lat: 23.7845,
    lng: 90.392,
    aliases: ["mohakhali dohs", "dohs mohakhali"],
  },
  {
    name: "Mohakhali Bus Terminal",
    displayName: "Mohakhali Bus Terminal, Dhaka",
    lat: 23.777,
    lng: 90.3985,
    aliases: ["mohakhali bus terminal", "mohakhali bus stand"],
  },
  {
    name: "Gulshan 2",
    displayName: "Gulshan 2, Dhaka",
    lat: 23.7938,
    lng: 90.4143,
    aliases: [
      "gulshan 2",
      "gulshan-2",
      "gulshan circle 2",
      "gulshan 2 circle",
      "pink city",
    ],
  },
  {
    name: "Gulshan 1",
    displayName: "Gulshan 1, Dhaka",
    lat: 23.7788,
    lng: 90.4172,
    aliases: [
      "gulshan 1",
      "gulshan-1",
      "gulshan circle 1",
      "gulshan 1 circle",
      "police plaza",
      "gulshan 1 dcc",
    ],
  },
  {
    name: "Banani",
    displayName: "Banani, Dhaka",
    lat: 23.7901,
    lng: 90.4062,
    aliases: [
      "banani",
      "banani 11",
      "road 11 banani",
      "kemal ataturk",
      "banani bazar",
      "chairman bari",
    ],
  },
  {
    name: "Banani DOHS",
    displayName: "Banani DOHS, Dhaka",
    lat: 23.799,
    lng: 90.4005,
    aliases: ["banani dohs", "dohs banani"],
  },
  {
    name: "Baridhara",
    displayName: "Baridhara Diplomatic Zone, Dhaka",
    lat: 23.7998,
    lng: 90.4225,
    aliases: [
      "baridhara",
      "baridhara diplomatic",
      "baridhara j block",
      "us embassy",
    ],
  },
  {
    name: "Baridhara DOHS",
    displayName: "Baridhara DOHS, Dhaka",
    lat: 23.8115,
    lng: 90.4132,
    aliases: ["baridhara dohs", "dohs baridhara"],
  },
  {
    name: "Dhanmondi 27",
    displayName: "Dhanmondi 27, Dhaka",
    lat: 23.7461,
    lng: 90.3742,
    aliases: [
      "dhanmondi 27",
      "dhanmondi-27",
      "shankar",
      "robingodown",
      "dhanmondi 27 school",
      "rapa plaza",
    ],
  },
  {
    name: "Dhanmondi 32",
    displayName: "Dhanmondi 32, Dhaka",
    lat: 23.7512,
    lng: 90.3768,
    aliases: [
      "dhanmondi 32",
      "dhanmondi-32",
      "dhanmondi lake",
      "dhanmondi",
      "bangabandhu museum",
    ],
  },
  {
    name: "Shimanto Square",
    displayName: "Shimanto Square, Dhanmondi 2, Dhaka",
    lat: 23.7388,
    lng: 90.3802,
    aliases: ["shimanto square", "dhanmondi 2", "bgb gate", "zigatola"],
  },
  {
    name: "Farmgate",
    displayName: "Farmgate, Dhaka",
    lat: 23.7697,
    lng: 90.3871,
    aliases: [
      "farmgate",
      "farm gate",
      "ananda cinema",
      "khamarbari",
      "farmgate bus stand",
      "holy cross",
    ],
  },
  {
    name: "Tejgaon",
    displayName: "Tejgaon Industrial Area, Dhaka",
    lat: 23.7645,
    lng: 90.398,
    aliases: [
      "tejgaon",
      "tejgaon industrial",
      "shaheen bag",
      "nabisco mor",
      "tibbat mor",
    ],
  },
  {
    name: "Kawran Bazar",
    displayName: "Kawran Bazar, Dhaka",
    lat: 23.7516,
    lng: 90.3938,
    aliases: [
      "kawran bazar",
      "karwan bazar",
      "pan pacific sonargaon",
      "petrobangla",
      "titas gas",
      "saarc fountain",
    ],
  },
  {
    name: "Shahbagh",
    displayName: "Shahbagh, Dhaka",
    lat: 23.7371,
    lng: 90.4032,
    aliases: [
      "shahbagh",
      "shahbag",
      "bsmmu",
      "dhaka club",
      "tsc",
      "curzon hall",
      "pg hospital",
      "national museum",
    ],
  },
  {
    name: "Motijheel",
    displayName: "Motijheel, Dhaka",
    lat: 23.7233,
    lng: 90.4185,
    aliases: [
      "motijheel",
      "motijheel c/a",
      "shapla chottor",
      "shapla chattar",
      "dilkusha",
      "motijheel office",
      "bangladesh bank",
    ],
  },
  {
    name: "Paltan",
    displayName: "Paltan / Baitul Mukarram, Dhaka",
    lat: 23.7289,
    lng: 90.4125,
    aliases: [
      "paltan",
      "purana paltan",
      "naya paltan",
      "baitul mukarram",
      "gpo",
      "stadium mor",
    ],
  },
  {
    name: "Uttara",
    displayName: "Uttara, Dhaka",
    lat: 23.8729,
    lng: 90.3984,
    aliases: [
      "uttara",
      "uttara sector 3",
      "house building",
      "jasimuddin",
      "azampur",
      "uttara sector 7",
      "uttara sector 10",
      "uttara sector 11",
    ],
  },
  {
    name: "Airport",
    displayName: "Hazrat Shahjalal International Airport, Dhaka",
    lat: 23.8433,
    lng: 90.4029,
    aliases: [
      "airport",
      "dhaka airport",
      "hazrat shahjalal international airport",
      "terminal 1",
      "terminal 2",
      "airport rail station",
    ],
  },
  {
    name: "Kuril",
    displayName: "Kuril Flyover / Bishwa Road, Dhaka",
    lat: 23.8172,
    lng: 90.4208,
    aliases: ["kuril", "kuril flyover", "kuril bishwa road", "kuril chowrasta"],
  },
  {
    name: "Khilkhet",
    displayName: "Khilkhet, Dhaka",
    lat: 23.83,
    lng: 90.418,
    aliases: [
      "khilkhet",
      "khilkhet bus stand",
      "nikunja 1",
      "nikunja 2",
      "nikunja",
    ],
  },
  {
    name: "Bashundhara R/A",
    displayName: "Bashundhara R/A, Dhaka",
    lat: 23.8151,
    lng: 90.4255,
    aliases: [
      "bashundhara",
      "bashundhara r/a",
      "jamuna future park",
      "nsu",
      "iub",
      "evercare hospital",
      "bashundhara gate",
    ],
  },
  {
    name: "Jamuna Future Park",
    displayName: "Jamuna Future Park, Kuril, Dhaka",
    lat: 23.8135,
    lng: 90.4242,
    aliases: ["jamuna future park", "jfp", "future park"],
  },
  {
    name: "Badda",
    displayName: "Merul Badda, Dhaka",
    lat: 23.7712,
    lng: 90.425,
    aliases: [
      "badda",
      "merul badda",
      "middle badda",
      "brac university",
      "badda link road",
    ],
  },
  {
    name: "Rampura",
    displayName: "Rampura Bridge / Hatirjheel, Dhaka",
    lat: 23.7618,
    lng: 90.4215,
    aliases: [
      "rampura",
      "rampura bridge",
      "tv bhaban",
      "hatirjheel rampura",
      "banasree",
    ],
  },
  {
    name: "Moghbazar",
    displayName: "Moghbazar, Dhaka",
    lat: 23.7485,
    lng: 90.4072,
    aliases: ["moghbazar", "wireless mor", "moghbazar flyover", "dilu road"],
  },
  {
    name: "Malibagh",
    displayName: "Malibagh / Mouchak, Dhaka",
    lat: 23.746,
    lng: 90.415,
    aliases: ["malibagh", "mouchak", "malibagh mor", "mouchak market"],
  },
  {
    name: "Khilgaon",
    displayName: "Khilgaon Taltola, Dhaka",
    lat: 23.7505,
    lng: 90.423,
    aliases: [
      "khilgaon",
      "taltola",
      "khilgaon flyover",
      "khilgaon restaurant zone",
    ],
  },
  {
    name: "Mirpur 10",
    displayName: "Mirpur 10, Dhaka",
    lat: 23.8069,
    lng: 90.3687,
    aliases: [
      "mirpur 10",
      "mirpur-10",
      "mirpur 10 golchottor",
      "mirpur circle 10",
      "stadium mirpur",
    ],
  },
  {
    name: "Mirpur 1",
    displayName: "Mirpur 1, Dhaka",
    lat: 23.7956,
    lng: 90.3537,
    aliases: [
      "mirpur 1",
      "mirpur-1",
      "mirpur",
      "sony cinema hall",
      "mirpur mazar",
    ],
  },
  {
    name: "Mirpur 12",
    displayName: "Mirpur 12, Dhaka",
    lat: 23.826,
    lng: 90.3645,
    aliases: ["mirpur 12", "mirpur-12", "mirpur 12 bus stand", "mirpur dohs"],
  },
  {
    name: "Agargaon",
    displayName: "Agargaon, Dhaka",
    lat: 23.778,
    lng: 90.379,
    aliases: [
      "agargaon",
      "passport office",
      "election commission",
      "idb bhaban",
      "agargaon metro station",
    ],
  },
  {
    name: "Shyamoli",
    displayName: "Shyamoli, Dhaka",
    lat: 23.7715,
    lng: 90.362,
    aliases: ["shyamoli", "shyamoli cinema", "shishu mela", "kalyanpur"],
  },
  {
    name: "Gabtoli",
    displayName: "Gabtoli Bus Terminal, Dhaka",
    lat: 23.782,
    lng: 90.344,
    aliases: [
      "gabtoli",
      "gabtoli bus terminal",
      "gabtoli mazar",
      "gabtoli bridge",
    ],
  },
  {
    name: "New Market",
    displayName: "Dhaka New Market / Nilkhet",
    lat: 23.7335,
    lng: 90.3842,
    aliases: [
      "new market",
      "nilkhet",
      "dhaka new market",
      "nilkhet book market",
      "azimpur",
    ],
  },
  {
    name: "Old Dhaka (Lalbagh)",
    displayName: "Lalbagh Fort, Old Dhaka",
    lat: 23.7188,
    lng: 90.3882,
    aliases: [
      "lalbagh",
      "lalbagh fort",
      "lalbagh kella",
      "old dhaka",
      "puran dhaka",
    ],
  },
  {
    name: "Old Dhaka (Sadarghat)",
    displayName: "Sadarghat Launch Terminal, Old Dhaka",
    lat: 23.705,
    lng: 90.412,
    aliases: [
      "sadarghat",
      "sadarghat launch terminal",
      "buriganga riverfront",
      "ahsan manzil",
    ],
  },
  {
    name: "Nazira Bazar",
    displayName: "Nazira Bazar (Haji Biryani), Old Dhaka",
    lat: 23.7145,
    lng: 90.4042,
    aliases: [
      "nazira bazar",
      "haji biryani",
      "bismillah kabab",
      "beauty lassi",
    ],
  },
];

/**
 * Matches a free-form query against known Dhaka landmarks.
 * Prioritizes longer/more specific alias matches first.
 */
export function matchDhakaLandmark(query: string): DhakaLandmark | null {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return null;

  const candidates: { landmark: DhakaLandmark; term: string }[] = [];
  for (const landmark of DHAKA_LANDMARKS) {
    candidates.push({ landmark, term: landmark.name.toLowerCase() });
    if (landmark.aliases) {
      for (const alias of landmark.aliases) {
        candidates.push({ landmark, term: alias.toLowerCase() });
      }
    }
  }

  candidates.sort((a, b) => b.term.length - a.term.length);

  for (const { landmark, term } of candidates) {
    if (normalized.includes(term)) {
      return landmark;
    }
  }

  return null;
}

/**
 * Returns autocomplete suggestions for Dhaka landmarks based on partial query.
 * Matches multi-term keywords and ranks exact prefix and word matches first.
 */
export function getDhakaLandmarksAutocomplete(
  query: string
): { displayName: string; lat: number; lng: number; category?: string }[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) {
    return DHAKA_LANDMARKS.slice(0, 8).map((l) => ({
      displayName: l.displayName,
      lat: l.lat,
      lng: l.lng,
      category: "Popular Area",
    }));
  }

  const terms = normalized.split(/\s+/).filter(Boolean);

  const scored: { landmark: DhakaLandmark; score: number }[] = [];

  for (const landmark of DHAKA_LANDMARKS) {
    const nameLower = landmark.name.toLowerCase();
    const displayLower = landmark.displayName.toLowerCase();
    const aliasesLower = (landmark.aliases || []).map((a) => a.toLowerCase());
    const allStrings = [nameLower, displayLower, ...aliasesLower];

    // Check if every search term appears in at least one of the string targets
    const matchesAllTerms = terms.every((term) =>
      allStrings.some((s) => s.includes(term))
    );

    if (matchesAllTerms) {
      let score = 0;
      if (nameLower === normalized || displayLower === normalized) {
        score += 100;
      } else if (
        nameLower.startsWith(normalized) ||
        displayLower.startsWith(normalized)
      ) {
        score += 50;
      } else if (aliasesLower.some((a) => a === normalized)) {
        score += 40;
      } else if (aliasesLower.some((a) => a.startsWith(normalized))) {
        score += 30;
      } else if (nameLower.includes(normalized)) {
        score += 20;
      } else {
        score += 10;
      }

      scored.push({ landmark, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 8).map(({ landmark }) => ({
    displayName: landmark.displayName,
    lat: landmark.lat,
    lng: landmark.lng,
    category: "Dhaka Landmark",
  }));
}

export interface AiSearchOption {
  displayName: string;
  lat: number;
  lng: number;
  category?: string;
  confidence?: number;
}

// Local In-Memory Cache for Model Responses
interface CachedItem<T> {
  timestamp: number;
  data: T;
}

const aiOptionsCache = new Map<string, CachedItem<AiSearchOption[]>>();
const aiLocationCache = new Map<string, CachedItem<AiLocationResult>>();
const MAX_CACHE_ENTRIES = 500;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function setCacheItem<T>(
  map: Map<string, CachedItem<T>>,
  key: string,
  data: T
): void {
  if (map.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = map.keys().next().value;
    if (oldestKey !== undefined) {
      map.delete(oldestKey);
    }
  }
  map.set(key, { timestamp: Date.now(), data });
}

function getCacheItem<T>(
  map: Map<string, CachedItem<T>>,
  key: string
): T | null {
  const cached = map.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    map.delete(key);
    return null;
  }
  return cached.data;
}

export function clearAiMemoryCache(): void {
  aiOptionsCache.clear();
  aiLocationCache.clear();
}

export function getAiCacheStats(): {
  optionsEntries: number;
  locationEntries: number;
} {
  return {
    optionsEntries: aiOptionsCache.size,
    locationEntries: aiLocationCache.size,
  };
}

async function callGeminiAPI(
  apiKey: string,
  systemInstructionText: string,
  userPromptText: string,
  timeoutMs: number = 7000
): Promise<{ ok: boolean; status: number; text?: string; error?: string }> {
  const models = [
    process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    "gemini-3-flash-preview",
  ];

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      console.log(`[Gemini AI] Querying active model: ${model}...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
        apiKey.trim()
      )}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstructionText }] },
          contents: [{ parts: [{ text: userPromptText }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return { ok: true, status: response.status, text: rawContent };
      }

      const errorBody =
        typeof response.text === "function"
          ? await response.text().catch(() => "")
          : "";
      console.error(
        `[Gemini AI] Model ${model} returned HTTP ${response.status}:`,
        errorBody
      );

      if (response.status === 404 && model !== models[models.length - 1]) {
        console.warn(
          `[Gemini AI] ${model} not available (404), falling back to ${
            models[models.length - 1]
          }...`
        );
        continue;
      }

      return { ok: false, status: response.status, error: errorBody };
    } catch (err: any) {
      console.error(`[Gemini AI] Error calling ${model}:`, err?.message || err);
      if (model !== models[models.length - 1]) {
        continue;
      }
      return { ok: false, status: 0, error: err?.message || "Network error" };
    }
  }

  return { ok: false, status: 500, error: "All models failed" };
}

export async function getDhakaLandmarksOptions(
  query: string,
  contextLatLng?: [number, number]
): Promise<AiSearchOption[]> {
  const normalized = query.toLowerCase().trim();

  // If query is empty, return popular Dhaka hubs
  if (!normalized) {
    return [
      {
        displayName: "Gulshan 2 Circle, Dhaka",
        lat: 23.7938,
        lng: 90.4143,
        category: "Commercial",
      },
      {
        displayName: "Banani Road 11, Dhaka",
        lat: 23.7901,
        lng: 90.4062,
        category: "Food & Shopping",
      },
      {
        displayName: "Dhanmondi 27 (Road 27), Dhaka",
        lat: 23.7461,
        lng: 90.3742,
        category: "Residential",
      },
      {
        displayName: "Jamuna Future Park, Kuril, Dhaka",
        lat: 23.8135,
        lng: 90.4242,
        category: "Shopping Mall",
      },
      {
        displayName: "Hazrat Shahjalal International Airport",
        lat: 23.8433,
        lng: 90.4029,
        category: "Transit",
      },
      {
        displayName: "Motijheel Commercial Area, Dhaka",
        lat: 23.7233,
        lng: 90.4185,
        category: "Financial District",
      },
    ];
  }

  // Check Local In-Memory Cache first (prevents redundant model calls for identical input)
  const cacheKey = contextLatLng
    ? `options:${normalized}:${contextLatLng[0].toFixed(
        3
      )},${contextLatLng[1].toFixed(3)}`
    : `options:${normalized}:none`;

  const cachedOptions = getCacheItem(aiOptionsCache, cacheKey);
  if (cachedOptions) {
    console.log(
      `[Gemini AI Cache HIT] Serving cached options for query: "${query}"`
    );
    return cachedOptions;
  }

  // Attempt Gemini API call if key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim() !== "") {
    const systemInstructionText =
      'You are a Dhaka, Bangladesh location assistant. Given a query or place description, return up to 5 matching place options in Dhaka. Respond ONLY with a valid JSON array: [{ "displayName": string, "lat": number, "lng": number, "category": string }]. Coordinates must be in Dhaka metro area (lat 23.6-23.9, lng 90.3-90.5).';

    const userPromptText = contextLatLng
      ? `Location Search: "${query}"\nUser pickup context: [${contextLatLng[0]}, ${contextLatLng[1]}]`
      : `Location Search: "${query}"`;

    const apiResult = await callGeminiAPI(
      apiKey,
      systemInstructionText,
      userPromptText,
      7000
    );

    if (apiResult.ok && apiResult.text && typeof apiResult.text === "string") {
      let cleaned = apiResult.text.trim();
      if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
      else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
      if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
      cleaned = cleaned.trim();

      try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter(
            (p) =>
              typeof p?.displayName === "string" &&
              typeof p?.lat === "number" &&
              typeof p?.lng === "number" &&
              p.lat >= 23.4 &&
              p.lat <= 24.2 &&
              p.lng >= 90.1 &&
              p.lng <= 90.7
          );
          if (valid.length > 0) {
            console.log(
              `[Gemini AI] Successfully received ${valid.length} places from active Gemini model.`
            );
            const options = valid.slice(0, 5).map((p) => ({
              displayName: p.displayName,
              lat: p.lat,
              lng: p.lng,
              category: p.category ? `✨ ${p.category}` : "✨ Gemini AI",
            }));
            setCacheItem(aiOptionsCache, cacheKey, options);
            return options;
          }
        }
      } catch (err: any) {
        console.error(
          "[Gemini AI] Failed to parse JSON from active Gemini model:",
          err?.message || err
        );
      }
    }
  } else {
    console.warn(
      "[Gemini AI] No GEMINI_API_KEY detected in process.env. Using Dhaka landmark matching."
    );
  }

  // Resilient Offline Dhaka Semantic & Keyword Matching
  if (
    normalized.includes("biryani") ||
    normalized.includes("old dhaka") ||
    normalized.includes("puran dhaka") ||
    normalized.includes("food")
  ) {
    return [
      {
        displayName: "Haji Biryani, Nazira Bazar, Old Dhaka",
        lat: 23.7145,
        lng: 90.4042,
        category: "Famous Biryani",
      },
      {
        displayName: "Nanna Biryani, Becharam Dewri, Old Dhaka",
        lat: 23.717,
        lng: 90.3955,
        category: "Morog Polao / Biryani",
      },
      {
        displayName: "Bismillah Kabab Ghar, Nazira Bazar, Old Dhaka",
        lat: 23.7152,
        lng: 90.4038,
        category: "Old Dhaka Food",
      },
      {
        displayName: "Sultan's Dine, Gulshan 2, Dhaka",
        lat: 23.7925,
        lng: 90.415,
        category: "Kacchi Biryani",
      },
      {
        displayName: "Ahsan Manzil (Pink Palace), Old Dhaka",
        lat: 23.7086,
        lng: 90.406,
        category: "Historical Landmark",
      },
    ];
  }

  if (
    normalized.includes("shopping") ||
    normalized.includes("mall") ||
    normalized.includes("market") ||
    normalized.includes("buy")
  ) {
    return [
      {
        displayName: "Jamuna Future Park, Kuril, Dhaka",
        lat: 23.8135,
        lng: 90.4242,
        category: "Largest Mall",
      },
      {
        displayName: "Bashundhara City Shopping Complex, Panthapath",
        lat: 23.7508,
        lng: 90.3912,
        category: "Shopping Mall",
      },
      {
        displayName: "Pink City Shopping Mall, Gulshan 2",
        lat: 23.7942,
        lng: 90.4138,
        category: "Fashion & Retail",
      },
      {
        displayName: "Shimanto Square, Dhanmondi Road 2",
        lat: 23.7388,
        lng: 90.3802,
        category: "Shopping Center",
      },
      {
        displayName: "New Market, Azimpur / Nilkhet, Dhaka",
        lat: 23.7335,
        lng: 90.3842,
        category: "Traditional Market",
      },
    ];
  }

  if (
    normalized.includes("hospital") ||
    normalized.includes("doctor") ||
    normalized.includes("clinic")
  ) {
    return [
      {
        displayName: "Square Hospital, Panthapath, Dhaka",
        lat: 23.7533,
        lng: 90.3828,
        category: "Tertiary Hospital",
      },
      {
        displayName: "Evercare Hospital, Bashundhara R/A",
        lat: 23.8103,
        lng: 90.4312,
        category: "Specialized Hospital",
      },
      {
        displayName: "United Hospital, Gulshan 2, Dhaka",
        lat: 23.7995,
        lng: 90.418,
        category: "Super-Specialty",
      },
      {
        displayName: "Dhaka Medical College Hospital, Bakshibazar",
        lat: 23.7258,
        lng: 90.398,
        category: "Public Hospital",
      },
    ];
  }

  if (
    normalized.includes("university") ||
    normalized.includes("college") ||
    normalized.includes("varsity") ||
    normalized.includes("campus")
  ) {
    return [
      {
        displayName: "Dhaka University (TSC / Curzon Hall)",
        lat: 23.733,
        lng: 90.3962,
        category: "University Campus",
      },
      {
        displayName: "BUET, Palashi, Dhaka",
        lat: 23.7262,
        lng: 90.3925,
        category: "Engineering University",
      },
      {
        displayName: "North South University (NSU), Bashundhara",
        lat: 23.8151,
        lng: 90.4255,
        category: "Private University",
      },
      {
        displayName: "BRAC University, Merul Badda, Dhaka",
        lat: 23.7712,
        lng: 90.425,
        category: "University Campus",
      },
    ];
  }

  if (
    normalized.includes("park") ||
    normalized.includes("lake") ||
    normalized.includes("garden")
  ) {
    return [
      {
        displayName: "Dhanmondi Lake Park, Dhanmondi 32",
        lat: 23.7512,
        lng: 90.3768,
        category: "Public Park & Lake",
      },
      {
        displayName: "Hatirjheel Waterfront Amphitheatre",
        lat: 23.768,
        lng: 90.4075,
        category: "Waterfront Promenade",
      },
      {
        displayName: "Ramna Park, Shahbagh, Dhaka",
        lat: 23.738,
        lng: 90.401,
        category: "Historic Park",
      },
      {
        displayName: "Gulshan Lake Park, Road 63, Gulshan 2",
        lat: 23.796,
        lng: 90.419,
        category: "Urban Park",
      },
    ];
  }

  const autoMatched = getDhakaLandmarksAutocomplete(query);
  if (autoMatched.length > 0) {
    return autoMatched.slice(0, 5).map((l) => ({
      displayName: l.displayName,
      lat: l.lat,
      lng: l.lng,
      category: l.category || "Matched Landmark",
    }));
  }

  const matched = DHAKA_LANDMARKS.filter((l) => {
    if (l.name.toLowerCase().includes(normalized)) return true;
    if (l.displayName.toLowerCase().includes(normalized)) return true;
    if (
      l.aliases?.some(
        (a) =>
          a.toLowerCase().includes(normalized) ||
          normalized.includes(a.toLowerCase())
      )
    ) {
      return true;
    }
    return false;
  });

  if (matched.length > 0) {
    return matched.slice(0, 5).map((l) => ({
      displayName: l.displayName,
      lat: l.lat,
      lng: l.lng,
      category: "Matched Landmark",
    }));
  }

  const single = matchDhakaLandmark(query);
  if (single) {
    return [
      {
        displayName: single.displayName,
        lat: single.lat,
        lng: single.lng,
        category: "Top Match",
      },
      ...DHAKA_LANDMARKS.filter((l) => l.name !== single.name)
        .slice(0, 4)
        .map((l) => ({
          displayName: l.displayName,
          lat: l.lat,
          lng: l.lng,
          category: "Suggested Alternative",
        })),
    ];
  }

  // Fallback: return top Dhaka landmarks
  return DHAKA_LANDMARKS.slice(0, 5).map((l) => ({
    displayName: l.displayName,
    lat: l.lat,
    lng: l.lng,
    category: "Dhaka Area",
  }));
}

/**
 * Creates safe fallback result if Gemini is unavailable, unconfigured, or fails.
 */
function getFallbackLocation(
  prompt: string,
  contextLatLng?: [number, number],
  reason: string = "AI resolution unavailable"
): AiLocationResult {
  const matchedLandmark = matchDhakaLandmark(prompt);
  if (matchedLandmark) {
    return {
      lat: matchedLandmark.lat,
      lng: matchedLandmark.lng,
      displayName: `[Estimated] ${matchedLandmark.name} Area`,
      confidence: 0.4,
      warning: `Estimated location based on landmark keyword match (${reason})`,
      isFallback: true,
    };
  }

  if (
    contextLatLng &&
    Array.isArray(contextLatLng) &&
    contextLatLng.length === 2
  ) {
    return {
      lat: contextLatLng[0],
      lng: contextLatLng[1],
      displayName: "[Estimated] Near Pickup Location",
      confidence: 0.3,
      warning: `Estimated location based on context coordinates (${reason})`,
      isFallback: true,
    };
  }

  return {
    lat: DHAKA_CENTER[0],
    lng: DHAKA_CENTER[1],
    displayName: "[Estimated] Dhaka City Center",
    confidence: 0.2,
    warning: `Estimated fallback to Dhaka city center (${reason})`,
    isFallback: true,
  };
}

/**
 * Resolves a natural language location prompt in Dhaka using the Google Gemini API,
 * with resilient offline/landmark fallback matching.
 */
export async function resolveNaturalLanguageLocation(
  prompt: string,
  contextLatLng?: [number, number]
): Promise<AiLocationResult> {
  const normalizedPrompt = prompt.toLowerCase().trim();
  const cacheKey = contextLatLng
    ? `nl:${normalizedPrompt}:${contextLatLng[0].toFixed(
        3
      )},${contextLatLng[1].toFixed(3)}`
    : `nl:${normalizedPrompt}:none`;

  const cachedLocation = getCacheItem(aiLocationCache, cacheKey);
  if (cachedLocation) {
    console.log(
      `[Gemini AI Cache HIT] Serving cached coordinates for: "${prompt}"`
    );
    return cachedLocation;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return getFallbackLocation(
      prompt,
      contextLatLng,
      "Gemini API key is unset"
    );
  }

  const systemInstructionText =
    'You are a Dhaka, Bangladesh location resolver. Given a natural language description of a place in Dhaka, return the best matching coordinates. Respond ONLY with JSON: { "lat": number, "lng": number, "displayName": string, "confidence": number }.';

  const userPromptText = contextLatLng
    ? `User Prompt: ${prompt}\nContext Coordinates (lat, lng): [${contextLatLng[0]}, ${contextLatLng[1]}]`
    : `User Prompt: ${prompt}`;

  try {
    const apiResult = await callGeminiAPI(
      apiKey,
      systemInstructionText,
      userPromptText,
      8000
    );

    if (!apiResult.ok || !apiResult.text) {
      return getFallbackLocation(
        prompt,
        contextLatLng,
        apiResult.error || `Gemini API HTTP ${apiResult.status}`
      );
    }

    const rawContent = apiResult.text;

    if (!rawContent || typeof rawContent !== "string") {
      return getFallbackLocation(
        prompt,
        contextLatLng,
        "Empty or invalid response from Gemini API"
      );
    }

    let cleaned = rawContent.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return getFallbackLocation(
        prompt,
        contextLatLng,
        "Unable to parse JSON from AI response"
      );
    }

    if (
      typeof parsed?.lat !== "number" ||
      typeof parsed?.lng !== "number" ||
      typeof parsed?.displayName !== "string" ||
      typeof parsed?.confidence !== "number"
    ) {
      return getFallbackLocation(
        prompt,
        contextLatLng,
        "AI response missing required coordinate fields"
      );
    }

    // Dhaka metro bounding box sanity check: lat ~ [23.4, 24.2], lng ~ [90.1, 90.7]
    const lat = parsed.lat;
    const lng = parsed.lng;
    if (lat < 23.4 || lat > 24.2 || lng < 90.1 || lng > 90.7) {
      return getFallbackLocation(
        prompt,
        contextLatLng,
        "AI returned coordinates outside Dhaka metropolitan area"
      );
    }

    const confidence = Math.max(0, Math.min(1, parsed.confidence));

    const finalResult: AiLocationResult = {
      lat,
      lng,
      displayName: parsed.displayName,
      confidence,
      ...(confidence < 0.5
        ? {
            warning:
              "Low confidence AI match - please verify pin location on map",
          }
        : {}),
    };

    setCacheItem(aiLocationCache, cacheKey, finalResult);
    return finalResult;
  } catch (err: any) {
    return getFallbackLocation(
      prompt,
      contextLatLng,
      err instanceof Error ? err.message : "Error resolving location with AI"
    );
  }
}
