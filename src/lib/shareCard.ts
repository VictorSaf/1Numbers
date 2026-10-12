/**
 * Cardul de distribuit: unde se despart școlile, ca imagine.
 *
 * Nu poartă numele și nici data nașterii (R6) — doar întrebările și cifrele
 * fiecărei școli. Culorile se citesc din tokenii temei, ca imaginea să arate ca
 * pagina; canvas-ul nu înțelege var(), deci rezolvăm aici valoarea.
 */

import type { Comparison } from "@/lib/models/elements";

const token = (name: string, fallback: string) => {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v ? `hsl(${v})` : fallback;
  } catch {
    return fallback;
  }
};

export interface CardText {
  title: string;
  summary: string;
  footer: string;
}

/** Cele mai largi despărțiri întâi; acordurile nu intră pe card. */
export function pickSplits(list: Comparison[], max = 4): Comparison[] {
  return list
    .filter((c) => c.verdict === "apart" || c.verdict === "near")
    .sort((a, b) => b.spread - a.spread)
    .slice(0, max);
}

const wrap = (ctx: CanvasRenderingContext2D, text: string, width: number): string[] => {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > width && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
};

export async function renderShareCard(list: Comparison[], text: CardText): Promise<Blob | null> {
  const W = 1080, H = 1350, P = 88;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const bg = token("--plate", "#14161c");
  const fg = token("--plate-ink", "#f2efe6");
  const gilt = token("--plate-gilt", "#b3a46a");
  const tension = token("--plate-tension", "#c46a9a");
  const muted = token("--plate-muted", "#9a9a9a");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  let y = P + 20;
  ctx.fillStyle = gilt;
  ctx.fillRect(P, y, 80, 3);
  y += 56;
  ctx.font = "500 54px Literata, Georgia, serif";
  ctx.fillStyle = fg;
  for (const l of wrap(ctx, text.title, W - 2 * P)) { ctx.fillText(l, P, y); y += 66; }
  y += 8;
  ctx.font = "30px Raleway, system-ui, sans-serif";
  ctx.fillStyle = muted;
  for (const l of wrap(ctx, text.summary, W - 2 * P)) { ctx.fillText(l, P, y); y += 42; }
  y += 40;

  for (const c of pickSplits(list)) {
    ctx.fillStyle = c.verdict === "apart" ? tension : gilt;
    ctx.fillRect(P, y, W - 2 * P, 2);
    y += 52;
    ctx.font = "500 36px Literata, Georgia, serif";
    ctx.fillStyle = fg;
    for (const l of wrap(ctx, c.question, W - 2 * P)) { ctx.fillText(l, P, y); y += 44; }
    ctx.font = "44px 'IBM Plex Mono', ui-monospace, monospace";
    ctx.fillStyle = c.verdict === "apart" ? tension : gilt;
    ctx.fillText(c.groups.map((g) => g.display).join("  /  "), P, y + 12);
    y += 76;
    if (y > H - 200) break;
  }

  ctx.font = "24px 'IBM Plex Mono', ui-monospace, monospace";
  ctx.fillStyle = muted;
  ctx.fillText(text.footer, P, H - P);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}
