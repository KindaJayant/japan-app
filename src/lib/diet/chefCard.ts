import type { Diet } from "./types";

/** Polite pre-written cards to show restaurant staff. Reviewed Japanese — keep wording conservative. */
export const CHEF_CARD: Record<Diet, { ja: string; en: string }> = {
  veg: {
    ja: "私はベジタリアンです。肉・魚・卵は食べられません（だし、エキス、ゼラチンも含みます）。牛乳・乳製品は大丈夫です。食べられる料理はありますか？ご協力ありがとうございます。",
    en: "I am vegetarian. I cannot eat meat, fish or egg (including dashi stock, extracts and gelatin). Milk and dairy are fine. Is there a dish I can eat? Thank you for your help.",
  },
  jain: {
    ja: "私はジャイナ教の菜食主義者です。肉・魚・卵（だし、エキス、ゼラチンを含む）に加えて、玉ねぎ・にんにく・じゃがいも・にんじんなどの根菜、きのこ、はちみつも食べられません。牛乳・乳製品は大丈夫です。食べられる料理はありますか？ご協力ありがとうございます。",
    en: "I follow a Jain vegetarian diet. Besides meat, fish and egg (including dashi, extracts and gelatin), I cannot eat root vegetables such as onion, garlic, potato and carrot, or mushrooms or honey. Dairy is fine. Is there a dish I can eat? Thank you for your help.",
  },
  halal: {
    ja: "私はイスラム教徒です。豚肉・ラード・ゼラチン、お酒・みりん・料理酒を含む料理は食べられません。ハラール認証のない肉も控えています。食べられる料理はありますか？ご協力ありがとうございます。",
    en: "I am Muslim. I cannot eat pork, lard or gelatin, or food made with alcohol, mirin or cooking sake. I also avoid meat that is not halal-certified. Is there a dish I can eat? Thank you for your help.",
  },
};
