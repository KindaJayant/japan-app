export type EtiquetteContext =
  | "onsen"
  | "shrine"
  | "temple"
  | "train"
  | "taxi"
  | "restaurant"
  | "street"
  | "money"
  | "home";

export interface Rule {
  do: string;
  why: string;
  emoji: string;
}

export const ETIQUETTE: Record<EtiquetteContext, Rule[]> = {
  onsen: [
    { emoji: "🚿", do: "Wash fully at the shower stools before getting in.", why: "The bath is for soaking, not cleaning." },
    { emoji: "🩱", do: "No swimwear. Bathing is nude and separated by gender.", why: "Swimsuits are seen as unhygienic." },
    { emoji: "🧖", do: "Keep the small towel out of the water. Fold it on your head.", why: "Towels in the water are a hygiene no-no." },
    { emoji: "🐉", do: "Tattoos may be refused. Look for 'tattoo OK' onsen or use a private bath (kashikiri).", why: "Historical link to organised crime." },
    { emoji: "🤫", do: "Keep your voice low and don't swim or splash.", why: "Onsen are for quiet relaxation." },
  ],
  shrine: [
    { emoji: "⛩️", do: "Bow once at the torii and walk along the sides of the path.", why: "The centre is for the deity." },
    { emoji: "💧", do: "At the water basin, rinse your left hand, then right, then your mouth (from your cupped hand).", why: "Purification before prayer." },
    { emoji: "🙏", do: "To pray: drop a coin, bow twice, clap twice, pray, then bow once.", why: "Standard Shinto prayer." },
    { emoji: "📷", do: "Don't photograph inside the main hall unless signs allow it.", why: "Sacred space." },
  ],
  temple: [
    { emoji: "👟", do: "Take your shoes off where you see a step up or slippers. Wear clean socks.", why: "Raised floors are indoor space." },
    { emoji: "🙏", do: "At temples, pray quietly with hands together. No clapping (that's for shrines).", why: "Buddhist vs Shinto custom." },
    { emoji: "🕯️", do: "You may waft incense smoke toward yourself for good health.", why: "Believed to bring healing." },
  ],
  train: [
    { emoji: "📵", do: "Phones on silent and no calls on trains.", why: "Trains are quiet spaces." },
    { emoji: "🚶", do: "Queue at the floor markings and let people off first.", why: "Keeps rush hour moving." },
    { emoji: "🎒", do: "Wear your backpack on your front in crowds. Big suitcases need a reserved seat on the Shinkansen.", why: "Space is tight." },
    { emoji: "🍱", do: "Eating is fine on the Shinkansen (try an ekiben), but not on local commuter trains.", why: "Local norm." },
    { emoji: "🚺", do: "Pink 'Women Only' carriages run at rush hour on some lines.", why: "Safety for women." },
  ],
  taxi: [
    { emoji: "🚪", do: "Don't touch the door. The driver opens and closes it automatically.", why: "Remote-controlled doors." },
    { emoji: "📇", do: "Show the Kanji destination card. Drivers often don't read English addresses.", why: "Navigation is by Japanese address." },
    { emoji: "💳", do: "Most taxis accept cards and IC cards (Suica/Pasmo). Night surcharge applies after 10pm.", why: "Know before you go." },
  ],
  restaurant: [
    { emoji: "🙅", do: "No tipping. Leaving money can confuse or offend.", why: "Good service is the standard." },
    { emoji: "🥢", do: "Never stand chopsticks upright in rice or pass food chopstick-to-chopstick.", why: "Both are funeral rituals." },
    { emoji: "🍜", do: "Slurping noodles is fine, even polite.", why: "Shows you're enjoying it." },
    { emoji: "🔔", do: "Call staff with 'Sumimasen!' or the table button.", why: "Staff won't hover." },
    { emoji: "💴", do: "Pay at the register, not the table. Use the small tray for cash.", why: "Cash isn't handed over hand-to-hand." },
    { emoji: "🧾", do: "Ticket machines (食券) at ramen shops: buy first, hand the ticket to staff.", why: "Very common at casual places." },
  ],
  street: [
    { emoji: "🗑️", do: "Bins are rare. Carry a small bag for your trash and sort at hotels or konbini.", why: "Public bins were removed for security." },
    { emoji: "🚶", do: "Don't eat while walking in busy streets. Stand by the stall to finish.", why: "Seen as messy and rude in many areas." },
    { emoji: "🚬", do: "Smoking only in marked smoking areas.", why: "Street smoking is banned in many wards." },
    { emoji: "🦌", do: "Nara deer bow back if you bow, but only feed them official shika-senbei.", why: "Other food makes them sick." },
    { emoji: "🧍", do: "Stand left on escalators in Tokyo, right in Osaka.", why: "Regional habit." },
  ],
  money: [
    { emoji: "💴", do: "Carry some cash (¥10,000–20,000). Small temples, stalls and rural places can be cash-only.", why: "Cards are common but not universal." },
    { emoji: "🏧", do: "7-Eleven and Japan Post ATMs are the most reliable for international Visa/Mastercard debit cards.", why: "Most reliable ATMs." },
    { emoji: "🧾", do: "Tax-free shopping over ¥5,000: show your passport at the till.", why: "Saves 10%." },
  ],
  home: [
    { emoji: "🩴", do: "Shoes off at the genkan (entrance). Use toilet slippers only in the toilet.", why: "Indoor cleanliness." },
    { emoji: "🎁", do: "Bring a small gift (omiyage) from India when visiting someone's home.", why: "Gift culture." },
  ],
};

export const ETIQUETTE_CONTEXTS = Object.keys(ETIQUETTE) as EtiquetteContext[];
