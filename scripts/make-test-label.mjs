import sharp from "sharp";
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520">
<rect width="900" height="520" fill="#fffdf6"/>
<rect x="20" y="20" width="860" height="480" fill="none" stroke="#222" stroke-width="3"/>
<g font-family="Yu Gothic, Meiryo, MS Gothic, sans-serif" fill="#111" font-size="30">
<text x="40" y="70" font-size="34" font-weight="bold">名称　即席カップめん</text>
<text x="40" y="125">原材料名　油揚げめん（小麦粉、植物油脂、食塩）、</text>
<text x="40" y="170">スープ（豚脂、しょうゆ、かつおエキス、チキンエキス、</text>
<text x="40" y="215">ねぎ、香辛料）、かやく（えび、卵、ねぎ）、</text>
<text x="40" y="260">調味料（アミノ酸等）、カラメル色素</text>
<text x="40" y="320">内容量　78g</text>
<text x="40" y="370" font-size="24">（一部に小麦・えび・卵・乳成分・豚肉・鶏肉を含む）</text>
</g></svg>`;
await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile("fixtures/labels/cupnoodle-synthetic.jpg");
console.log("ok");
