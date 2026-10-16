import { createFileRoute } from "@tanstack/react-router";
import { HtmlWidget } from "@/components/chat/genui/HtmlWidget";
import { sanitizeLeakedToolText } from "@/pages/chat/chatUtils";
import raw from "./-sample.txt?raw";
const m = /```widget\n([\s\S]*?)```/.exec(sanitizeLeakedToolText(raw));
export const Route = createFileRoute("/widget-preview")({
  component: () => <div className="mx-auto max-w-md p-4">{m ? <HtmlWidget html={m[1]} done /> : "NO WIDGET"}</div>,
});
