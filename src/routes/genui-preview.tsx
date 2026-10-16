import { createFileRoute } from "@tanstack/react-router";
import { GenUIBlock } from "@/components/chat/genui/GenUIBlock";

const A = JSON.stringify({ title: "Plan your Egypt trip", blocks: [{ type: "hero", title: "مصر", subtitle: "الأهرامات والنيل والبحر الأحمر", image: "Pyramids of Giza", tag: "رحلة" }, { type: "slider", id: "b", label: "الميزانية", min: 300, max: 5000, step: 100, unit: "USD", default: 1500 }, { type: "number", id: "d", label: "عدد الأيام", min: 2, max: 30, default: 7 }, { type: "choice", id: "s", label: "نوع الرحلة", options: ["تاريخية", "شواطئ", "صحراء", "رحلة نيلية"], multi: true }], submit: { label: "اقترح رحلتي" } });
const B = JSON.stringify({ title: "أفضل موبايلات", blocks: [{ type: "cards", items: [{ title: "iPhone 16", subtitle: "كاميرا ممتازة", price: "$799", meta: "Apple", image: "iPhone 16" }, { title: "Galaxy S25", price: "$799", meta: "Samsung", image: "Samsung Galaxy S25" }, { title: "Pixel 9", price: "$699", meta: "Google", image: "Pixel 9" }] }, { type: "gallery", items: [{ image: "Luxor Temple", caption: "الأقصر" }, { image: "Abu Simbel", caption: "أبو سمبل" }] }, { type: "stats", items: [{ label: "متوسط السعر", value: "$766" }, { label: "التقييم", value: "4.7" }] }, { type: "steps", items: ["اختار الميزانية", "قارن الكاميرات"] }, { type: "note", text: "نصيحة سريعة" }, { type: "buttons", items: [{ label: "قارن الكاميرات" }, { label: "الأرخص" }] }] });

export const Route = createFileRoute("/genui-preview")({
  component: () => (
    <div className="mx-auto max-w-md bg-background p-4">
      <GenUIBlock source={A} />
      <GenUIBlock source={B} />
    </div>
  ),
});
