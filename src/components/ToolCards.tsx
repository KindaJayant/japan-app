import Link from "next/link";

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const jpy = (n: number) => "¥" + Math.round(n).toLocaleString("ja-JP");

interface Budget {
  days: number;
  travellers: number;
  style: string;
  perPersonInr: Record<string, number>;
  perPersonTotalInr: number;
  groupTotalInr: number;
  dailySpendJpy: number;
  rail: { legs: { from: string; to: string; fare: number; time: string; train: string }[]; jrPassWorthIt: boolean };
  fx: string;
}

const LINE_LABEL: Record<string, string> = {
  flights: "Return flights",
  stay: "Stay (twin share)",
  food: "Food",
  localTransport: "Metro & buses",
  intercityRail: "Shinkansen / rail",
  activities: "Entry & experiences",
  visaInsuranceSim: "Visa, insurance, eSIM",
};

/** The budget as a printed shop receipt. */
export function BudgetReceipt({ data }: { data: Budget }) {
  return (
    <div className="on-pastel mx-auto w-full max-w-sm rotate-[0.6deg] bg-[#fffaf0] px-5 pt-5 pb-6 shadow-[3px_3px_0_#2b2522] ink">
      <p className="text-center font-mincho text-lg font-extrabold">旅の見積書</p>
      <p className="eyebrow text-center">Trip estimate · {data.days} days · {data.style}</p>
      <dl className="mt-4 space-y-1.5 text-sm">
        {Object.entries(data.perPersonInr).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt>{LINE_LABEL[k] ?? k}</dt>
            <dd className="tabular-nums">{inr(v)}</dd>
          </div>
        ))}
      </dl>
      <div className="perforation mt-3 pt-3">
        <div className="flex justify-between font-bold">
          <span>Per person</span>
          <span className="tabular-nums">{inr(data.perPersonTotalInr)}</span>
        </div>
        {data.travellers > 1 && (
          <div className="mt-1 flex justify-between text-lg font-extrabold">
            <span>{data.travellers} travellers</span>
            <span className="tabular-nums">{inr(data.groupTotalInr)}</span>
          </div>
        )}
      </div>
      {data.rail.legs.length > 0 && (
        <ul className="mt-3 space-y-0.5 text-xs opacity-80">
          {data.rail.legs.map((l) => (
            <li key={l.from + l.to}>
              {l.from} → {l.to}: {l.train}, {l.time}, {jpy(l.fare)}
            </li>
          ))}
          <li className="font-bold">{data.rail.jrPassWorthIt ? "JR Pass is worth it for this route." : "Skip the JR Pass: single tickets are cheaper."}</li>
        </ul>
      )}
      <p className="mt-3 text-[11px] opacity-60">
        On the ground ≈ {jpy(data.dailySpendJpy)}/day · {data.fx}
      </p>
    </div>
  );
}

interface Food {
  city: string;
  diet: string;
  places: { name: string; area: string; type: string; fit: string; priceJpy: number }[];
}

export function FoodCard({ data }: { data: Food }) {
  if (!data.places.length) return null;
  return (
    <div className="rounded-lg ink bg-washi-deep p-4">
      <p className="eyebrow text-sumi-soft">
        {data.diet} food · {data.city}
      </p>
      <ul className="mt-2 space-y-2">
        {data.places.slice(0, 4).map((p) => (
          <li key={p.name} className="flex justify-between gap-3 text-sm">
            <span>
              <span className="font-bold">{p.name}</span>
              <span className="block text-sumi-soft">
                {p.type} · {p.area}
              </span>
            </span>
            <span className="shrink-0 tabular-nums text-sumi-soft">{jpy(p.priceJpy)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PlaceTicket({ data }: { data: { id: string; name: string; nameJa: string; city: string } }) {
  return (
    <Link transitionTypes={["nav-forward"]} href={`/taxi/${data.id}`} className="press ticket on-pastel flex items-center bg-yamabuki">
      <span className="flex-1 px-4 py-3">
        <span lang="ja" className="block font-mincho text-lg font-extrabold">
          {data.nameJa}
        </span>
        <span className="text-xs">{data.name} · taxi card →</span>
      </span>
      <span className="border-l-2 border-dashed border-[#2b252266] px-4 font-mincho text-2xl font-extrabold">車</span>
    </Link>
  );
}
