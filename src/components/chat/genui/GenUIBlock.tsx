/** @doc Renders a validated ```ui spec as a polished card with real photos; clicks go back to the agent. */
import { createContext, useContext, useMemo, useState } from "react";
import { ArrowUpRight, Check, ChevronRight, Lightbulb, Minus, Plus } from "lucide-react";
import { formatSubmission, parseUISpec, type Block, type Values } from "./schema";
import { SmartImage } from "./SmartImage";

export const GenUIActionContext = createContext<((text: string) => void) | undefined>(undefined);

const initial = (blocks: Block[]): Values => {
  const v: Values = {};
  for (const b of blocks) {
    if (b.type === "slider") v[b.id] = b.default ?? Math.round((b.min + b.max) / 2 / (b.step ?? 1)) * (b.step ?? 1);
    if (b.type === "number") v[b.id] = b.default ?? b.min ?? 1;
    if (b.type === "choice") v[b.id] = b.default ?? (b.multi ? [] : undefined);
  }
  return v;
};

const fmt = (n: number) => n.toLocaleString();
const SHELL = "my-4 not-prose overflow-hidden rounded-3xl border border-border/60 bg-card text-card-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_32px_-12px_rgba(0,0,0,0.25)]";

export function GenUIBlock({ source }: { source: string }) {
  const spec = useMemo(() => parseUISpec(source), [source]);
  const onSend = useContext(GenUIActionContext);
  const [values, setValues] = useState<Values>(() => (spec ? initial(spec.blocks) : {}));
  const [sent, setSent] = useState(false);
  const set = (k: string, v: Values[string]) => setValues((s) => ({ ...s, [k]: v }));

  if (!spec) {
    return (
      <div className={SHELL}>
        <div className="h-32 animate-pulse bg-muted" />
        <div className="space-y-2 p-5">
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-muted" />
          <div className="h-10 animate-pulse rounded-2xl bg-muted/70" />
        </div>
      </div>
    );
  }

  const act = (text: string) => {
    if (sent || !onSend) return;
    setSent(true);
    onSend(text);
  };
  const startsWithHero = spec.blocks[0]?.type === "hero";

  return (
    <div className={SHELL} dir="auto">
      {spec.image && !startsWithHero && (
        <div className="relative">
          <SmartImage src={spec.image} alt={spec.title} className="h-40 w-full sm:h-48" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        </div>
      )}
      <div className={`space-y-5 p-5 ${spec.image && !startsWithHero ? "-mt-10 relative" : ""}`}>
        {(spec.title || spec.subtitle) && !startsWithHero && (
          <header>
            {spec.title && <h3 className="text-[17px] font-semibold tracking-tight text-foreground">{spec.title}</h3>}
            {spec.subtitle && <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">{spec.subtitle}</p>}
          </header>
        )}
        {spec.blocks.map((b, i) => (
          <BlockView key={i} b={b} values={values} set={set} disabled={sent} act={act} first={i === 0} />
        ))}
        {spec.submit && (
          <button
            type="button"
            disabled={sent || !onSend}
            onClick={() => act(formatSubmission(spec, values))}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-[14.5px] font-semibold text-background transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {sent ? <Check size={16} /> : null}
            {sent ? "Sent" : spec.submit.label}
          </button>
        )}
      </div>
    </div>
  );
}

function Label({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-2">
      <span className="text-[13px] font-medium text-muted-foreground">{children}</span>
      {aside && <span className="text-[15px] font-semibold tabular-nums text-foreground">{aside}</span>}
    </div>
  );
}

const field = "h-11 w-full rounded-2xl border border-border/60 bg-muted/40 px-4 text-[14px] text-foreground outline-none transition focus:border-foreground/40 focus:bg-background";

function BlockView({ b, values, set, disabled, act, first }: { b: Block; values: Values; set: (k: string, v: Values[string]) => void; disabled: boolean; act: (t: string) => void; first: boolean }) {
  switch (b.type) {
    case "hero":
      return (
        <div className={`relative overflow-hidden rounded-2xl ${first ? "-mx-5 -mt-5 rounded-none" : ""}`}>
          <SmartImage src={b.image} alt={b.title} className="h-52 w-full sm:h-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-background">
            {b.tag && <span className="mb-2 inline-block rounded-full bg-background/20 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur">{b.tag}</span>}
            <h3 className="text-[21px] font-semibold leading-tight tracking-tight">{b.title}</h3>
            {b.subtitle && <p className="mt-1 text-[13px] opacity-85">{b.subtitle}</p>}
          </div>
        </div>
      );
    case "gallery":
      return (
        <div className="-mx-5 flex snap-x gap-2.5 overflow-x-auto px-5 [scrollbar-width:none]">
          {b.items.map((g, i) => (
            <figure key={i} className="w-[160px] shrink-0 snap-start">
              <SmartImage src={g.image} alt={g.caption} className="aspect-[4/5] w-full rounded-2xl" />
              {g.caption && <figcaption className="mt-1.5 line-clamp-1 text-[12.5px] text-muted-foreground">{g.caption}</figcaption>}
            </figure>
          ))}
        </div>
      );
    case "choice": {
      const cur = values[b.id];
      const picked = (o: string) => (Array.isArray(cur) ? cur.includes(o) : cur === o);
      const toggle = (o: string) => {
        if (!b.multi) return set(b.id, o);
        const arr = Array.isArray(cur) ? cur : [];
        set(b.id, arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o]);
      };
      return (
        <div>
          <Label>{b.label}</Label>
          <div className="grid grid-cols-2 gap-2">
            {b.options.map((o) => (
              <button
                key={o}
                type="button"
                disabled={disabled}
                aria-pressed={picked(o)}
                onClick={() => toggle(o)}
                className={`flex min-h-11 items-center justify-between gap-2 rounded-2xl border px-3.5 py-2 text-start text-[13.5px] font-medium transition active:scale-[0.98] ${picked(o) ? "border-foreground bg-foreground text-background" : "border-border/60 bg-muted/30 text-foreground hover:border-foreground/30"}`}
              >
                <span>{o}</span>
                {picked(o) && <Check size={15} className="shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      );
    }
    case "slider": {
      const v = Number(values[b.id] ?? b.min);
      const pct = ((v - b.min) / (b.max - b.min || 1)) * 100;
      return (
        <div>
          <Label aside={`${fmt(v)}${b.unit ? ` ${b.unit}` : ""}`}>{b.label}</Label>
          <input
            type="range" aria-label={b.label} min={b.min} max={b.max} step={b.step ?? 1} value={v} disabled={disabled}
            onChange={(e) => set(b.id, Number(e.target.value))}
            style={{ background: `linear-gradient(to right, var(--foreground) ${pct}%, var(--muted) ${pct}%)` }}
            className="h-2 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-md"
          />
          <div className="mt-1.5 flex justify-between text-[11.5px] tabular-nums text-muted-foreground">
            <span>{fmt(b.min)}</span>
            <span>{fmt(b.max)}</span>
          </div>
        </div>
      );
    }
    case "number": {
      const v = Number(values[b.id] ?? 0);
      const clamp = (n: number) => Math.min(b.max ?? Infinity, Math.max(b.min ?? -Infinity, n));
      return (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/40 py-2 ps-4 pe-2">
          <span className="text-[14px] font-medium text-foreground">{b.label}</span>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Decrease" disabled={disabled} onClick={() => set(b.id, clamp(v - 1))} className="grid size-9 place-items-center rounded-full bg-background shadow-sm transition active:scale-90"><Minus size={15} /></button>
            <span className="min-w-9 text-center text-[16px] font-semibold tabular-nums">{v}</span>
            <button type="button" aria-label="Increase" disabled={disabled} onClick={() => set(b.id, clamp(v + 1))} className="grid size-9 place-items-center rounded-full bg-background shadow-sm transition active:scale-90"><Plus size={15} /></button>
          </div>
        </div>
      );
    }
    case "date":
      return (
        <div>
          <Label>{b.label}</Label>
          <input type="date" aria-label={b.label} disabled={disabled} value={String(values[b.id] ?? "")} onChange={(e) => set(b.id, e.target.value)} className={field} />
        </div>
      );
    case "text":
      return (
        <div>
          <Label>{b.label}</Label>
          <input type="text" aria-label={b.label} disabled={disabled} placeholder={b.placeholder} value={String(values[b.id] ?? "")} onChange={(e) => set(b.id, e.target.value)} className={field} />
        </div>
      );
    case "cards":
      return (
        <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          {b.items.map((c, i) => (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => act(`${c.action || "Tell me more about"}: ${c.title}`)}
              className="group flex w-[220px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border/60 bg-background text-start transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative">
                <SmartImage src={c.image} query={c.title} alt={c.title} className="aspect-[4/3] w-full" />
                {c.price && <span className="absolute bottom-2 start-2 rounded-full bg-background/90 px-2.5 py-1 text-[12.5px] font-semibold text-foreground backdrop-blur">{c.price}</span>}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3.5">
                <span className="text-[14.5px] font-semibold leading-snug text-foreground">{c.title}</span>
                {c.subtitle && <span className="line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">{c.subtitle}</span>}
                <span className="mt-auto flex items-center justify-between pt-2 text-[12px] text-muted-foreground">
                  <span>{c.meta}</span>
                  <ArrowUpRight size={15} className="transition group-hover:text-foreground rtl:-scale-x-100" />
                </span>
              </div>
            </button>
          ))}
        </div>
      );
    case "table":
      return (
        <div className="-mx-5 overflow-x-auto px-5">
          <div className="min-w-full overflow-hidden rounded-2xl border border-border/60">
            <table className="w-full border-collapse text-[13px]">
              <thead className="bg-muted/60">
                <tr>{b.columns.map((c, i) => <th key={i} className="whitespace-nowrap px-3.5 py-2.5 text-start text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">{c}</th>)}</tr>
              </thead>
              <tbody>
                {b.rows.map((r, i) => (
                  <tr key={i} className="border-t border-border/50">
                    {r.map((c, j) => <td key={j} className={`px-3.5 py-2.5 ${j === 0 ? "font-semibold text-foreground" : "text-foreground/80"}`}>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case "chart": {
      const max = Math.max(...b.items.map((x) => Math.abs(x.value)), 1);
      return (
        <div className="rounded-2xl bg-muted/40 p-4">
          {b.label && <Label>{b.label}</Label>}
          <div className="space-y-3">
            {b.items.map((x, i) => (
              <div key={x.label}>
                <div className="mb-1 flex justify-between text-[12.5px]">
                  <span className="text-foreground/80">{x.label}</span>
                  <span className="font-semibold tabular-nums text-foreground">{fmt(x.value)}{b.unit ? ` ${b.unit}` : ""}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-background">
                  <div className="h-full rounded-full bg-foreground transition-all duration-700" style={{ width: `${(Math.abs(x.value) / max) * 100}%`, opacity: 1 - i * 0.08 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "stats":
      return (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {b.items.map((s) => (
            <div key={s.label} className="rounded-2xl bg-muted/50 p-3.5">
              <div className="text-[12px] text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-[20px] font-semibold tracking-tight tabular-nums text-foreground">{typeof s.value === "number" ? fmt(s.value) : s.value}</div>
            </div>
          ))}
        </div>
      );
    case "steps":
      return (
        <ol className="relative space-y-4">
          {b.items.map((s, i) => (
            <li key={i} className="relative flex gap-3.5 text-[14px] leading-relaxed text-foreground">
              {i < b.items.length - 1 && <span className="absolute start-[13px] top-8 h-[calc(100%-12px)] w-px bg-border" />}
              <span className="relative grid size-7 shrink-0 place-items-center rounded-full bg-foreground text-[12.5px] font-semibold text-background">{i + 1}</span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
      );
    case "note":
      return (
        <div className="flex gap-3 rounded-2xl border border-border/60 bg-muted/40 p-3.5 text-[13.5px] leading-relaxed text-foreground/85">
          <Lightbulb size={17} className="mt-0.5 shrink-0 text-muted-foreground" />
          <p>{b.text}</p>
        </div>
      );
    case "buttons":
      return (
        <div className="flex flex-wrap gap-2">
          {b.items.map((x) => (
            <button key={x.label} type="button" disabled={disabled} onClick={() => act(x.action || x.label)} className="flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-4 py-2 text-[13.5px] font-medium text-foreground transition hover:bg-muted active:scale-[0.97] disabled:opacity-50">
              {x.label}
              <ChevronRight size={15} className="text-muted-foreground rtl:rotate-180" />
            </button>
          ))}
        </div>
      );
  }
}
