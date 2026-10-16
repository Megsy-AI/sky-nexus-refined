/** @doc Renders a validated ```ui spec as a clean glass card; clicks go back to the agent. */
import { createContext, useContext, useMemo, useState } from "react";
import { Check, ChevronRight, Minus, Plus } from "lucide-react";
import { GlassWidget } from "@/components/chat/widgets/GlassWidget";
import { formatSubmission, parseUISpec, type Block, type Values } from "./schema";

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

export function GenUIBlock({ source }: { source: string }) {
  const spec = useMemo(() => parseUISpec(source), [source]);
  const onSend = useContext(GenUIActionContext);
  const [values, setValues] = useState<Values>(() => (spec ? initial(spec.blocks) : {}));
  const [sent, setSent] = useState(false);
  const set = (k: string, v: Values[string]) => setValues((s) => ({ ...s, [k]: v }));

  if (!spec) {
    return (
      <GlassWidget className="my-3 p-4" aria-busy>
        <div className="h-3.5 w-1/3 animate-pulse rounded-full bg-foreground/10" />
        <div className="mt-4 h-9 animate-pulse rounded-xl bg-foreground/[0.06]" />
        <div className="mt-2 h-9 w-2/3 animate-pulse rounded-xl bg-foreground/[0.06]" />
      </GlassWidget>
    );
  }

  const act = (text: string) => {
    if (sent || !onSend) return;
    setSent(true);
    onSend(text);
  };

  return (
    <GlassWidget className="my-3 not-prose">
      <div dir="auto" className="space-y-4 p-4">
        {(spec.title || spec.subtitle) && (
          <header>
            {spec.title && <h3 className="text-[15px] font-semibold leading-tight text-foreground">{spec.title}</h3>}
            {spec.subtitle && <p className="mt-1 text-[13px] text-muted-foreground">{spec.subtitle}</p>}
          </header>
        )}
        {spec.blocks.map((b, i) => (
          <BlockView key={i} b={b} values={values} set={set} disabled={sent} act={act} />
        ))}
        {spec.submit && (
          <button
            type="button"
            disabled={sent || !onSend}
            onClick={() => act(formatSubmission(spec, values))}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-[14px] font-semibold text-primary-foreground transition active:scale-[0.98] disabled:opacity-60"
          >
            {sent ? <Check size={16} /> : null}
            {sent ? "Sent" : spec.submit.label}
          </button>
        )}
      </div>
    </GlassWidget>
  );
}

function Label({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-2 text-[13px]">
      <span className="font-medium text-foreground/85">{children}</span>
      {aside && <span className="font-semibold tabular-nums text-foreground">{aside}</span>}
    </div>
  );
}

const field = "h-10 w-full rounded-xl border border-border/60 bg-foreground/[0.04] px-3 text-[14px] text-foreground outline-none focus:border-primary/60";

function BlockView({ b, values, set, disabled, act }: { b: Block; values: Values; set: (k: string, v: Values[string]) => void; disabled: boolean; act: (t: string) => void }) {
  switch (b.type) {
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
          <div className="flex flex-wrap gap-2">
            {b.options.map((o) => (
              <button
                key={o}
                type="button"
                disabled={disabled}
                aria-pressed={picked(o)}
                onClick={() => toggle(o)}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] transition ${picked(o) ? "border-primary bg-primary/15 text-foreground" : "border-border/60 text-foreground/75 hover:bg-foreground/[0.05]"}`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      );
    }
    case "slider": {
      const v = Number(values[b.id] ?? b.min);
      return (
        <div>
          <Label aside={`${fmt(v)}${b.unit ? ` ${b.unit}` : ""}`}>{b.label}</Label>
          <input type="range" aria-label={b.label} min={b.min} max={b.max} step={b.step ?? 1} value={v} disabled={disabled} onChange={(e) => set(b.id, Number(e.target.value))} className="w-full accent-primary" />
          <div className="mt-1 flex justify-between text-[11.5px] text-muted-foreground tabular-nums">
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
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-foreground/85">{b.label}</span>
          <div className="flex items-center gap-1 rounded-full border border-border/60 p-1">
            <button type="button" aria-label="Decrease" disabled={disabled} onClick={() => set(b.id, clamp(v - 1))} className="grid size-8 place-items-center rounded-full hover:bg-foreground/[0.06]"><Minus size={14} /></button>
            <span className="min-w-8 text-center text-[14px] font-semibold tabular-nums">{v}</span>
            <button type="button" aria-label="Increase" disabled={disabled} onClick={() => set(b.id, clamp(v + 1))} className="grid size-8 place-items-center rounded-full hover:bg-foreground/[0.06]"><Plus size={14} /></button>
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
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {b.items.map((c, i) => (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => act(`${c.action || "Tell me more about"}: ${c.title}`)}
              className="flex w-[210px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border/60 bg-foreground/[0.03] text-start transition hover:bg-foreground/[0.06]"
            >
              {c.image && /^https:\/\//.test(c.image) && <img src={c.image} alt="" loading="lazy" className="h-28 w-full object-cover" />}
              <div className="flex flex-1 flex-col gap-1 p-3">
                <span className="text-[14px] font-semibold leading-snug text-foreground">{c.title}</span>
                {c.subtitle && <span className="line-clamp-2 text-[12.5px] text-muted-foreground">{c.subtitle}</span>}
                <span className="mt-auto flex items-center justify-between pt-2 text-[12.5px]">
                  <span className="text-muted-foreground">{c.meta}</span>
                  {c.price && <span className="font-semibold text-foreground">{c.price}</span>}
                </span>
              </div>
            </button>
          ))}
        </div>
      );
    case "table":
      return (
        <div className="-mx-4 overflow-x-auto px-4">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>{b.columns.map((c) => <th key={c} className="border-b border-border/60 px-2 py-2 text-start font-semibold text-foreground/80">{c}</th>)}</tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className="border-b border-border/30 last:border-0">
                  {r.map((c, j) => <td key={j} className={`px-2 py-2 ${j === 0 ? "font-medium text-foreground" : "text-foreground/80"}`}>{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "chart": {
      const max = Math.max(...b.items.map((x) => Math.abs(x.value)), 1);
      return (
        <div>
          {b.label && <Label>{b.label}</Label>}
          <div className="space-y-2">
            {b.items.map((x) => (
              <div key={x.label} className="grid grid-cols-[minmax(70px,30%)_1fr_auto] items-center gap-2 text-[12.5px]">
                <span className="truncate text-foreground/80">{x.label}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-foreground/[0.06]">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${(Math.abs(x.value) / max) * 100}%` }} />
                </span>
                <span className="tabular-nums font-semibold text-foreground">{fmt(x.value)}{b.unit ? ` ${b.unit}` : ""}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "stats":
      return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {b.items.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border/50 bg-foreground/[0.03] p-3">
              <div className="text-[11.5px] text-muted-foreground">{s.label}</div>
              <div className="mt-0.5 text-[17px] font-semibold tabular-nums text-foreground">{typeof s.value === "number" ? fmt(s.value) : s.value}</div>
            </div>
          ))}
        </div>
      );
    case "steps":
      return (
        <ol className="space-y-2.5">
          {b.items.map((s, i) => (
            <li key={i} className="flex gap-3 text-[13.5px] text-foreground/90">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-[12px] font-semibold text-foreground">{i + 1}</span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
      );
    case "note":
      return <p className="rounded-xl bg-foreground/[0.04] px-3 py-2 text-[13px] text-foreground/80">{b.text}</p>;
    case "buttons":
      return (
        <div className="flex flex-col gap-2">
          {b.items.map((x) => (
            <button key={x.label} type="button" disabled={disabled} onClick={() => act(x.action || x.label)} className="flex h-11 items-center justify-between rounded-2xl border border-border/60 px-4 text-[14px] text-foreground transition hover:bg-foreground/[0.05] disabled:opacity-60">
              {x.label}
              <ChevronRight size={16} className="text-muted-foreground rtl:rotate-180" />
            </button>
          ))}
        </div>
      );
  }
}
