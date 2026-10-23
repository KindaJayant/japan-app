/** Step-by-step visual guides for the moments Indian travellers worry about most. */
export interface Ritual {
  id: string;
  title: string;
  ja: string;
  tone: "sakura" | "mizu" | "matcha" | "yamabuki";
  intro: string;
  steps: { seal: string; do: string; tip?: string }[];
}

export const RITUALS: Ritual[] = [
  {
    id: "shrine",
    title: "Praying at a shrine",
    ja: "神社の参拝",
    tone: "sakura",
    intro: "Shinto shrines have torii gates. The prayer is short, and you're welcome to join in.",
    steps: [
      { seal: "礼", do: "Bow once before passing under the torii.", tip: "Walk at the side of the path. The centre is for the deity." },
      { seal: "左", do: "At the water basin, take the ladle in your right hand and pour over your left hand.", tip: "Don't drink straight from the ladle." },
      { seal: "右", do: "Switch hands and rinse your right hand." },
      { seal: "口", do: "Pour a little into your cupped left hand and rinse your mouth, then let the ladle drain upright." },
      { seal: "銭", do: "At the hall, gently drop a coin in the box. ¥5 (go-en) is lucky: it sounds like 'good connection'." },
      { seal: "拝", do: "Bow twice, clap twice, pray silently with palms together, then bow once more." },
    ],
  },
  {
    id: "onsen",
    title: "Your first onsen",
    ja: "温泉の入り方",
    tone: "mizu",
    intro: "Hot-spring baths are shared and nude, separated by gender. Families can book a private bath (kashikiri).",
    steps: [
      { seal: "男", do: "Check the curtain: 男 (blue) is men, 女 (red) is women.", tip: "They sometimes swap daily." },
      { seal: "脱", do: "Undress completely in the changing room and leave everything in a basket or locker." },
      { seal: "洗", do: "Sit on a stool at the shower and wash your whole body and hair first.", tip: "Rinse the stool when you're done." },
      { seal: "布", do: "Keep the small towel out of the water. Fold it on your head." },
      { seal: "静", do: "Soak quietly. No swimming, no splashing, no photos." },
      { seal: "拭", do: "Pat yourself dry before going back into the changing room." },
    ],
  },
  {
    id: "temple",
    title: "Visiting a temple",
    ja: "お寺の作法",
    tone: "yamabuki",
    intro: "Buddhist temples will feel familiar to many Indian visitors. The manners are quiet and simple.",
    steps: [
      { seal: "靴", do: "Take shoes off where the floor steps up or slippers are lined up.", tip: "Wear clean socks without holes!" },
      { seal: "香", do: "If there's an incense burner, waft the smoke toward you. It's believed to heal." },
      { seal: "合", do: "Pray with palms together and a small bow. No clapping (that's for shrines)." },
      { seal: "写", do: "Photos are often banned inside halls. Look for the camera sign." },
    ],
  },
  {
    id: "train",
    title: "Riding the train",
    ja: "電車のマナー",
    tone: "matcha",
    intro: "Japanese trains are quiet, punctual and spotless. Follow the floor markings and you'll blend right in.",
    steps: [
      { seal: "列", do: "Queue at the marks on the platform floor." },
      { seal: "降", do: "Let everyone off before you get on." },
      { seal: "静", do: "Phone on silent. No calls on board." },
      { seal: "優", do: "Leave the priority seats for elders, pregnant women and people with disabilities." },
      { seal: "荷", do: "Wear your backpack on your front. Large suitcases need a reserved space on the Shinkansen." },
    ],
  },
];

export interface Phrase {
  ja: string;
  romaji: string;
  en: string;
}

export const PHRASES: { group: string; items: Phrase[] }[] = [
  {
    group: "Food",
    items: [
      { ja: "これに肉や魚は入っていますか？", romaji: "Kore ni niku ya sakana wa haitte imasu ka?", en: "Does this contain meat or fish?" },
      { ja: "だしは何から作っていますか？", romaji: "Dashi wa nani kara tsukutte imasu ka?", en: "What is the stock made from?" },
      { ja: "玉ねぎとにんにく抜きでお願いします。", romaji: "Tamanegi to ninniku nuki de onegai shimasu.", en: "No onion and no garlic, please." },
      { ja: "お酒やみりんは入っていますか？", romaji: "Osake ya mirin wa haitte imasu ka?", en: "Does it contain alcohol or mirin?" },
      { ja: "英語のメニューはありますか？", romaji: "Eigo no menyū wa arimasu ka?", en: "Do you have an English menu?" },
    ],
  },
  {
    group: "Getting around",
    items: [
      { ja: "ここまでお願いします。", romaji: "Koko made onegai shimasu.", en: "Please take me here." },
      { ja: "駅はどこですか？", romaji: "Eki wa doko desu ka?", en: "Where is the station?" },
      { ja: "トイレはどこですか？", romaji: "Toire wa doko desu ka?", en: "Where is the toilet?" },
      { ja: "いくらですか？", romaji: "Ikura desu ka?", en: "How much is it?" },
    ],
  },
  {
    group: "Courtesy",
    items: [
      { ja: "すみません。", romaji: "Sumimasen.", en: "Excuse me / Sorry." },
      { ja: "ありがとうございます。", romaji: "Arigatō gozaimasu.", en: "Thank you very much." },
      { ja: "助けてください。", romaji: "Tasukete kudasai.", en: "Please help me." },
    ],
  },
];

/** VERIFY before the demo. */
export const EMERGENCY = [
  { label: "Police", number: "110" },
  { label: "Ambulance / fire", number: "119" },
  { label: "Japan Visitor Hotline (24/7, English)", number: "050-3816-2787" },
  { label: "Embassy of India, Tokyo", number: "+81-3-3262-2391" },
];
