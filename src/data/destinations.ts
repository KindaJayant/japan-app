import type { EtiquetteContext } from "./etiquette";

export type ModelKind = "torii" | "pavilion" | "pagoda" | "hall";

export type Tone = "sakura" | "yamabuki" | "tokiha" | "matcha" | "sora" | "fuji" | "mizu";
export type Art = "torii" | "pavilion" | "pagoda" | "bamboo" | "lantern" | "bowl" | "city" | "hall" | "neon" | "sea-torii" | "fuji";

export interface Destination {
  id: string;
  name: string;
  nameJa: string;
  city: "Tokyo" | "Kyoto" | "Osaka" | "Nara" | "Hiroshima" | "Fuji";
  /** Show this to a taxi driver. */
  taxi: { ja: string; address: string; romaji: string; say: string };
  blurb: string;
  indiaLink?: string;
  funFact?: string;
  model?: ModelKind;
  etiquette: EtiquetteContext[];
  tone: Tone;
  art: Art;
  geo: { lat: number; lng: number };
  /** English Wikipedia article: source of the real photo (Wikimedia Commons). */
  wiki: string;
  /** Rain plan: outdoor stops get swapped when the forecast turns. */
  setting: "indoor" | "outdoor";
  /** Typical time to enjoy it. */
  hours: number;
  /** Stairs / distance on foot, for elders and kids. */
  walking: "easy" | "moderate" | "hard";
}

// Addresses + facts: double-check every entry before the demo.
export const DESTINATIONS: Destination[] = [
  {
    id: "fushimi-inari",
    name: "Fushimi Inari Taisha",
    nameJa: "伏見稲荷大社",
    city: "Kyoto",
    taxi: {
      ja: "伏見稲荷大社までお願いします。",
      address: "京都府京都市伏見区深草藪之内町68",
      romaji: "Fushimi Inari Taisha made onegai shimasu",
      say: "foo-shee-mee ee-nah-ree tie-shah mah-deh oh-neh-guy shee-mahs",
    },
    blurb: "Thousands of vermilion torii gates winding up Mount Inari. Go at sunrise to have the path almost to yourself.",
    indiaLink: "Inari is also worshipped as Dakiniten, a form drawn from the Indian ḍākinī, at temples like Toyokawa Inari.",
    funFact: "Each torii is donated by a business or family. Their name is painted on the back.",
    model: "torii",
    etiquette: ["shrine"],
    tone: "sakura",
    art: "torii",
    geo: { lat: 34.9671, lng: 135.7727 },
    wiki: "Fushimi_Inari-taisha",
    setting: "outdoor",
    hours: 2.5,
    walking: "hard",
  },
  {
    id: "kinkakuji",
    name: "Kinkaku-ji (Golden Pavilion)",
    nameJa: "金閣寺",
    city: "Kyoto",
    taxi: {
      ja: "金閣寺までお願いします。",
      address: "京都府京都市北区金閣寺町1",
      romaji: "Kinkakuji made onegai shimasu",
      say: "keen-kah-koo-jee mah-deh oh-neh-guy shee-mahs",
    },
    blurb: "A Zen temple whose top two floors are covered in gold leaf, mirrored in a still pond.",
    indiaLink: "Zen traces back to Bodhidharma, a South Indian monk. In Japan he is 'Daruma', the red wish-doll you'll see everywhere.",
    model: "pavilion",
    etiquette: ["temple"],
    tone: "yamabuki",
    art: "pavilion",
    geo: { lat: 35.0394, lng: 135.7292 },
    wiki: "Kinkaku-ji",
    setting: "outdoor",
    hours: 1,
    walking: "easy",
  },
  {
    id: "kiyomizu",
    name: "Kiyomizu-dera",
    nameJa: "清水寺",
    city: "Kyoto",
    taxi: {
      ja: "清水寺までお願いします。",
      address: "京都府京都市東山区清水1丁目294",
      romaji: "Kiyomizudera made onegai shimasu",
      say: "kee-yoh-mee-zoo-deh-rah mah-deh oh-neh-guy shee-mahs",
    },
    blurb: "A wooden stage jutting out over the hillside, with all of Kyoto below.",
    indiaLink: "The main deity is Kannon, Japan's name for Avalokiteshvara, the Bodhisattva of compassion from Indian Buddhism.",
    funFact: "The famous wooden stage is held together without nails.",
    model: "pagoda",
    etiquette: ["temple"],
    tone: "tokiha",
    art: "pagoda",
    geo: { lat: 34.9949, lng: 135.785 },
    wiki: "Kiyomizu-dera",
    setting: "outdoor",
    hours: 2,
    walking: "moderate",
  },
  {
    id: "arashiyama",
    name: "Arashiyama Bamboo Grove",
    nameJa: "嵐山 竹林の小径",
    city: "Kyoto",
    taxi: {
      ja: "天龍寺の北門（竹林の小径）までお願いします。",
      address: "京都府京都市右京区嵯峨天龍寺芒ノ馬場町68",
      romaji: "Tenryuji no kitamon made onegai shimasu",
      say: "ten-ryoo-jee no kee-tah-mon mah-deh oh-neh-guy shee-mahs",
    },
    blurb: "Walk through towering green bamboo, then have a Buddhist vegetarian lunch at Tenryu-ji.",
    funFact: "Tenryu-ji's Shigetsu serves shōjin ryōri, Buddhist temple food that is fully plant-based.",
    etiquette: ["temple", "street"],
    tone: "matcha",
    art: "bamboo",
    geo: { lat: 35.017, lng: 135.6713 },
    wiki: "Arashiyama",
    setting: "outdoor",
    hours: 3,
    walking: "moderate",
  },
  {
    id: "sensoji",
    name: "Senso-ji, Asakusa",
    nameJa: "浅草寺",
    city: "Tokyo",
    taxi: {
      ja: "浅草寺の雷門までお願いします。",
      address: "東京都台東区浅草2-3-1",
      romaji: "Sensoji no Kaminarimon made onegai shimasu",
      say: "sen-soh-jee no kah-mee-nah-ree-mon mah-deh oh-neh-guy shee-mahs",
    },
    blurb: "Tokyo's oldest temple. Walk through the giant Thunder Gate lantern, then down Nakamise street for snacks.",
    indiaLink: "Senso-ji is dedicated to Kannon (Avalokiteshvara), the same Bodhisattva revered across India's Buddhist heritage.",
    model: "pagoda",
    etiquette: ["temple", "street"],
    tone: "sakura",
    art: "lantern",
    geo: { lat: 35.7148, lng: 139.7967 },
    wiki: "Sensō-ji",
    setting: "outdoor",
    hours: 2,
    walking: "easy",
  },
  {
    id: "nakamuraya",
    name: "Shinjuku Nakamuraya",
    nameJa: "新宿中村屋",
    city: "Tokyo",
    taxi: {
      ja: "新宿中村屋までお願いします。",
      address: "東京都新宿区新宿3-26-13",
      romaji: "Shinjuku Nakamuraya made onegai shimasu",
      say: "sheen-joo-koo nah-kah-moo-rah-yah mah-deh oh-neh-guy shee-mahs",
    },
    blurb: "Where Japan first tasted real Indian curry, nearly a century ago.",
    indiaLink: "Indian revolutionary Rash Behari Bose took refuge here, married the owners' daughter, and introduced 'Indo-karii' in 1927. It is still on the menu.",
    etiquette: ["restaurant"],
    tone: "yamabuki",
    art: "bowl",
    geo: { lat: 35.6917, lng: 139.702 },
    wiki: "Shinjuku",
    setting: "indoor",
    hours: 1.5,
    walking: "easy",
  },
  {
    id: "shibuya",
    name: "Shibuya Crossing",
    nameJa: "渋谷スクランブル交差点",
    city: "Tokyo",
    taxi: {
      ja: "渋谷駅のハチ公口までお願いします。",
      address: "東京都渋谷区道玄坂2丁目",
      romaji: "Shibuya-eki no Hachiko-guchi made onegai shimasu",
      say: "shee-boo-yah eh-kee no hah-chee-koh goo-chee mah-deh oh-neh-guy shee-mahs",
    },
    blurb: "The world's busiest pedestrian crossing. Watch it from above, then meet the loyal dog Hachikō.",
    funFact: "Up to about 3,000 people cross at once when all the lights turn green.",
    etiquette: ["street", "train"],
    tone: "sora",
    art: "city",
    geo: { lat: 35.6595, lng: 139.7005 },
    wiki: "Shibuya_Crossing",
    setting: "outdoor",
    hours: 1.5,
    walking: "easy",
  },
  {
    id: "todaiji",
    name: "Tōdai-ji, Nara",
    nameJa: "東大寺",
    city: "Nara",
    taxi: {
      ja: "東大寺の南大門までお願いします。",
      address: "奈良県奈良市雑司町406-1",
      romaji: "Todaiji no Nandaimon made onegai shimasu",
      say: "toh-dye-jee no nahn-dye-mon mah-deh oh-neh-guy shee-mahs",
    },
    blurb: "A 15-metre bronze Buddha in one of the largest wooden buildings on Earth, with friendly bowing deer outside.",
    indiaLink: "In 752 CE the Great Buddha's eye-opening ceremony was led by Bodhisena, an Indian monk invited to Japan by the Emperor.",
    model: "hall",
    etiquette: ["temple", "street"],
    tone: "fuji",
    art: "hall",
    geo: { lat: 34.689, lng: 135.8398 },
    wiki: "Tōdai-ji",
    setting: "indoor",
    hours: 2,
    walking: "easy",
  },
  {
    id: "dotonbori",
    name: "Dōtonbori",
    nameJa: "道頓堀",
    city: "Osaka",
    taxi: {
      ja: "道頓堀のグリコの看板までお願いします。",
      address: "大阪府大阪市中央区道頓堀1丁目",
      romaji: "Dotonbori no Guriko no kanban made onegai shimasu",
      say: "doh-tohn-boh-ree no goo-ree-koh no kahn-bahn mah-deh oh-neh-guy shee-mahs",
    },
    blurb: "Neon, canals and Osaka's street-food culture. Use the scanner here: takoyaki has octopus, and dashi is everywhere.",
    etiquette: ["street", "restaurant"],
    tone: "fuji",
    art: "neon",
    geo: { lat: 34.6687, lng: 135.5013 },
    wiki: "Dōtonbori",
    setting: "outdoor",
    hours: 2.5,
    walking: "easy",
  },
  {
    id: "hiroshima",
    name: "Hiroshima Peace Memorial",
    nameJa: "広島平和記念公園",
    city: "Hiroshima",
    taxi: {
      ja: "平和記念公園までお願いします。",
      address: "広島県広島市中区中島町1",
      romaji: "Heiwa Kinen Koen made onegai shimasu",
      say: "hay-wah kee-nen koh-en mah-deh oh-neh-guy shee-mahs",
    },
    blurb: "A moving memorial and museum. Pair it with the floating torii at Miyajima, a short ferry away.",
    model: "torii",
    etiquette: ["temple"],
    tone: "mizu",
    art: "sea-torii",
    geo: { lat: 34.3916, lng: 132.4529 },
    wiki: "Hiroshima_Peace_Memorial_Park",
    setting: "indoor",
    hours: 3,
    walking: "moderate",
  },
  {
    id: "kawaguchiko",
    name: "Mt Fuji & Chureito Pagoda",
    nameJa: "新倉山浅間公園",
    city: "Fuji",
    taxi: {
      ja: "新倉山浅間公園（忠霊塔）までお願いします。",
      address: "山梨県富士吉田市浅間2-4-1",
      romaji: "Arakurayama Sengen Koen made onegai shimasu",
      say: "ah-rah-koo-rah-yah-mah sen-gen koh-en mah-deh oh-neh-guy shee-mahs",
    },
    blurb: "The postcard view: a five-storey pagoda in front of Mt Fuji. Climb about 400 steps for the shot, then walk the shore of Lake Kawaguchi.",
    funFact: "Fuji is clearest on cold mornings from November to February. By afternoon it often hides in cloud.",
    model: "pagoda",
    etiquette: ["street", "onsen"],
    tone: "sora",
    art: "fuji",
    geo: { lat: 35.5012, lng: 138.8012 },
    wiki: "Lake_Kawaguchi",
    setting: "outdoor",
    hours: 5,
    walking: "hard",
  },
];

export const destinationById = (id: string) => DESTINATIONS.find((d) => d.id === id);
