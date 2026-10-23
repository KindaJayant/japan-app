import type { DictEntry } from "./types";

/**
 * Hand-curated ingredient dictionary. THIS decides verdicts, not the LLM.
 *
 * Matching is longest-term-first with masking, so "牛乳" (milk) is consumed
 * before "牛" could ever match, and "牛蒡" (burdock) never reads as beef.
 * Entries with empty `effects` are deliberate "safe masks" for that reason.
 *
 * Diet conventions (Indian usage):
 *  veg   = lacto-vegetarian: no meat, fish, egg, gelatin; cheese rennet is "maybe".
 *  jain  = veg + no root/bulb vegetables, no mushrooms, no honey; yeast "maybe".
 *  halal = no pork, no alcohol; non-certified meat, gelatin & soy sauce "maybe".
 *
 * Add terms freely. Run `npm run eval:rules` after every change.
 */
const NO_MEAT = { veg: "no", jain: "no" } as const;

export const DICTIONARY: DictEntry[] = [
  // ── Pork ────────────────────────────────────────────────────────────────
  {
    id: "pork",
    terms: ["豚肉", "豚", "ポーク", "豚脂", "ラード", "豚エキス", "ポークエキス", "豚骨", "とんこつ", "ベーコン", "ハム", "ソーセージ", "pork", "lard", "bacon"],
    en: "Pork",
    effects: { veg: "no", jain: "no", halal: "no" },
    why: "Pork or pork fat",
  },
  // ── Beef / chicken / generic meat ───────────────────────────────────────
  {
    id: "beef",
    terms: ["牛肉", "牛脂", "ビーフ", "ビーフエキス", "牛エキス", "牛骨", "beef", "tallow"],
    en: "Beef",
    effects: { ...NO_MEAT, halal: "maybe" },
    why: "Meat (halal only if certified)",
  },
  {
    id: "chicken",
    terms: ["鶏肉", "チキン", "チキンエキス", "鶏脂", "鶏ガラ", "がらスープ", "チキンブイヨン", "鶏", "chicken"],
    en: "Chicken",
    effects: { ...NO_MEAT, halal: "maybe" },
    why: "Meat (halal only if certified)",
  },
  {
    id: "meat",
    terms: ["食肉", "肉エキス", "ミートエキス", "畜肉", "肉", "動物油脂", "動物性油脂", "動物性", "ブイヨン", "コンソメ", "meat extract"],
    en: "Meat / animal fat",
    effects: { ...NO_MEAT, halal: "maybe" },
    why: "Meat or animal fat of unknown source",
  },
  {
    id: "bone",
    terms: ["骨エキス", "ボーンブロス", "ゼラチン", "コラーゲン", "gelatin", "gelatine", "collagen"],
    en: "Gelatin / bone extract",
    effects: { veg: "no", jain: "no", halal: "no" },
    why: "Usually pork or beef derived",
  },
  // ── Fish & seafood (the hidden dashi problem) ───────────────────────────
  {
    id: "bonito",
    terms: ["かつお節", "かつおぶし", "鰹節", "かつおエキス", "かつおだし", "鰹だし", "かつお", "鰹", "katsuobushi", "bonito"],
    en: "Bonito (fish) / katsuobushi",
    effects: NO_MEAT,
    why: "Fish – the classic hidden dashi ingredient",
  },
  {
    id: "fish",
    terms: ["魚介エキス", "魚介", "魚粉", "魚醤", "魚油", "魚肉", "煮干し", "煮干", "いりこ", "さば", "鯖", "いわし", "鰯", "まぐろ", "鮪", "ツナ", "鮭", "サーモン", "たら", "鱈", "しらす", "ちりめん", "アンチョビ", "すり身", "かまぼこ", "ちくわ", "はんぺん", "fish", "anchovy", "tuna", "salmon"],
    en: "Fish",
    effects: NO_MEAT,
    why: "Fish or fish extract",
  },
  {
    id: "shellfish",
    terms: ["えび", "海老", "かに", "蟹", "いか", "烏賊", "たこ", "蛸", "ほたて", "帆立", "あさり", "牡蠣", "オイスター", "うに", "いくら", "たらこ", "明太子", "shrimp", "prawn", "crab", "squid", "oyster"],
    en: "Shellfish / seafood",
    effects: NO_MEAT,
    why: "Seafood",
  },
  {
    id: "dashi",
    terms: ["和風だし", "だしの素", "風味調味料", "だし", "出汁", "dashi"],
    en: "Dashi (stock – often fish)",
    effects: { veg: "maybe", jain: "maybe" },
    why: "Dashi is usually made with bonito unless it says kombu",
  },
  {
    id: "extract-generic",
    terms: ["エキス", "extract"],
    en: "Unspecified extract",
    effects: { veg: "maybe", jain: "maybe", halal: "maybe" },
    why: "Extract of unknown source",
  },
  // ── Egg ─────────────────────────────────────────────────────────────────
  {
    id: "egg",
    terms: ["卵殻カルシウム", "全卵", "鶏卵", "卵白", "卵黄", "卵", "たまご", "玉子", "egg"],
    en: "Egg",
    effects: NO_MEAT,
    why: "Contains egg",
  },
  // ── Dairy ───────────────────────────────────────────────────────────────
  {
    id: "cheese",
    terms: ["チーズ", "ナチュラルチーズ", "プロセスチーズ", "cheese"],
    en: "Cheese",
    effects: { veg: "maybe", jain: "maybe", halal: "maybe" },
    why: "Cheese may use animal rennet",
  },
  // ── Insects / animal-derived additives ──────────────────────────────────
  {
    id: "cochineal",
    terms: ["コチニール", "カルミン酸", "カルミン", "cochineal", "carmine"],
    en: "Cochineal (insect dye)",
    effects: NO_MEAT,
    why: "Red colour made from insects",
  },
  {
    id: "shellac",
    terms: ["シェラック", "shellac"],
    en: "Shellac (insect resin)",
    effects: { veg: "maybe", jain: "no" },
    why: "Insect-derived glaze",
  },
  {
    id: "honey",
    terms: ["はちみつ", "蜂蜜", "honey"],
    en: "Honey",
    effects: { jain: "no" },
    why: "Jains avoid honey",
  },
  // ── Alcohol (halal) ─────────────────────────────────────────────────────
  {
    id: "alcohol",
    terms: ["清酒", "料理酒", "本みりん", "みりん", "酒精", "酒粕", "日本酒", "洋酒", "ワイン", "リキュール", "ブランデー", "ビール", "アルコール", "酒", "mirin", "sake", "wine", "alcohol", "brandy", "liqueur"],
    en: "Alcohol (mirin / sake / wine)",
    effects: { halal: "no" },
    why: "Contains alcohol",
  },
  {
    id: "mirin-style",
    terms: ["みりん風調味料", "発酵調味料"],
    en: "Mirin-style / fermented seasoning",
    effects: { halal: "maybe" },
    why: "Fermented seasonings may contain alcohol",
  },
  {
    id: "soy-sauce",
    terms: ["しょうゆ", "醤油", "soy sauce"],
    en: "Soy sauce",
    effects: { halal: "maybe" },
    why: "Brewed soy sauce contains traces of alcohol",
  },
  {
    id: "emulsifier",
    terms: ["乳化剤", "emulsifier"],
    en: "Emulsifier",
    effects: { halal: "maybe" },
    why: "May be animal-derived",
  },
  {
    id: "shortening",
    terms: ["ショートニング", "shortening"],
    en: "Shortening",
    effects: { halal: "maybe" },
    why: "May contain animal fat",
  },
  // ── Jain: roots, bulbs, alliums, fungi ──────────────────────────────────
  {
    id: "onion",
    terms: ["たまねぎ", "玉ねぎ", "玉葱", "オニオン", "ねぎ", "葱", "らっきょう", "にら", "韮", "エシャロット", "onion", "leek", "shallot", "scallion"],
    en: "Onion / leek",
    effects: { jain: "no" },
    why: "Onion family – avoided in Jain diet",
  },
  {
    id: "garlic",
    terms: ["にんにく", "大蒜", "ガーリック", "garlic"],
    en: "Garlic",
    effects: { jain: "no" },
    why: "Garlic – avoided in Jain diet",
  },
  {
    id: "ginger",
    terms: ["しょうが", "生姜", "ジンジャー", "ginger"],
    en: "Ginger",
    effects: { jain: "no" },
    why: "Root vegetable",
  },
  {
    id: "potato",
    terms: ["馬鈴薯でん粉", "馬鈴薯でんぷん", "ばれいしょでん粉", "ばれいしょ", "馬鈴薯", "じゃがいも", "ポテト", "potato"],
    en: "Potato / potato starch",
    effects: { jain: "no" },
    why: "Root vegetable",
  },
  {
    id: "roots",
    terms: ["にんじん", "人参", "キャロット", "だいこん", "大根", "ごぼう", "牛蒡", "さつまいも", "さつま芋", "甘藷", "さといも", "里芋", "れんこん", "蓮根", "ビーツ", "やまいも", "山芋", "長芋", "こんにゃく", "蒟蒻", "carrot", "radish", "beetroot", "sweet potato", "konjac"],
    en: "Root vegetable",
    effects: { jain: "no" },
    why: "Root vegetable – avoided in Jain diet",
  },
  {
    id: "mushroom",
    terms: ["しいたけエキス", "しいたけ", "椎茸", "マッシュルーム", "きのこ", "しめじ", "まいたけ", "舞茸", "えのき", "エリンギ", "mushroom"],
    en: "Mushroom",
    effects: { jain: "no" },
    why: "Fungi – avoided in Jain diet",
  },
  {
    id: "yeast",
    terms: ["酵母エキス", "イーストエキス", "酵母", "イースト", "yeast extract", "yeast"],
    en: "Yeast / yeast extract",
    effects: { jain: "maybe" },
    why: "Some Jains avoid yeast",
  },

  // ── Safe masks: consume text that would otherwise false-match ───────────
  // (e.g. 牛乳 must not trigger 牛, 糖アルコール is not alcohol, グラム ≠ ラム)
  { id: "mask-milk", terms: ["牛乳", "乳製品", "脱脂粉乳", "全粉乳", "乳糖", "乳清", "ホエイ", "バター", "クリーム", "milk", "butter", "cream", "whey"], en: "Milk / dairy", effects: {} },
  { id: "mask-plant", terms: ["昆布エキス", "昆布だし", "こんぶ", "昆布", "野菜エキス", "トマト", "海藻", "わかめ", "のり", "海苔", "kombu", "seaweed", "eggplant", "なす"], en: "Plant / seaweed", effects: {} },
  { id: "mask-chem", terms: ["糖アルコール", "酒石酸", "アミノ酸", "乳酸", "乳酸カルシウム", "グラム", "ラムネ", "クエン酸", "肉桂", "果肉", "ただし", "野菜ブイヨン", "ベジタブルブイヨン"], en: "Additive (safe)", effects: {} },
  { id: "mask-words", terms: ["卵不使用", "肉不使用", "鶏卵不使用", "egg-free", "egg free"], en: "Free-from claim", effects: {} },
];
