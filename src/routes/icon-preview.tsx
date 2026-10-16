import { createFileRoute } from "@tanstack/react-router";
import { AgentIcon } from "@/components/agent/AgentIcon";
const names = ["Megsy","Claude Code","Codex","DeepSeek","OpenClaw","Hermes","Gemini","Higgsfield","Kling","Cursor"];
export const Route = createFileRoute("/icon-preview")({
  component: () => (
    <div className="grid grid-cols-5 gap-4 p-6">
      {names.map((n, i) => (
        <div key={n} className="flex flex-col items-center gap-1 text-xs">
          <span className="grid size-12 place-items-center rounded-xl border"><AgentIcon agent={{ id: n, name: n, description: "", prompt: "", isDefault: i === 0, color: "aurora" } as any} /></span>{n}
        </div>
      ))}
    </div>
  ),
});
