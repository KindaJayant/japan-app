import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/**
 * Tiny markdown renderer for Saathi's replies: headings, bullets, paragraphs,
 * **bold** and [links](/internal). Streaming-safe: half-written syntax renders as text.
 */
export function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) blocks.push(<ul key={blocks.length}>{list.map((l, i) => <li key={i}>{inline(l)}</li>)}</ul>);
    list = [];
  };
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*]\s+(.*)/);
    if (bullet) {
      list.push(bullet[1]);
      continue;
    }
    flush();
    if (!line.trim()) continue;
    const h = line.match(/^(#{1,3})\s+(.*)/);
    if (h) blocks.push(h[1].length <= 2 ? <h2 key={blocks.length}>{inline(h[2])}</h2> : <h3 key={blocks.length}>{inline(h[2])}</h3>);
    else blocks.push(<p key={blocks.length}>{inline(line)}</p>);
  }
  flush();
  return <div className="prose-saathi">{blocks}</div>;
}

function inline(s: string): ReactNode {
  const parts = s.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((p, i) => {
    const bold = p.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return <strong key={i}>{bold[1]}</strong>;
    const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = link[2];
      return href.startsWith("/") ? (
        <Link key={i} href={href}>
          {link[1]}
        </Link>
      ) : (
        <a key={i} href={href} target="_blank" rel="noreferrer">
          {link[1]}
        </a>
      );
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}
