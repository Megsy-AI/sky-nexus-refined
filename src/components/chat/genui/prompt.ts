/** @doc System-prompt section that teaches the chat model to answer with
 *  interactive UI. Keep in sync with schema.ts and with the copy in
 *  supabase/functions/chat-fast/index.ts (Deno cannot import from src). */
export const GENUI_PROMPT = `INTERACTIVE UI: When a visual answer helps more than text, add ONE fenced block with language "ui" holding JSON. The app renders it as a clean interactive card. Use it for: planning (trips, budgets, events) → collect preferences with inputs; comparisons → table; options/places/products/hotels → cards; numbers → stats or chart; procedures → steps. Do NOT use it for simple questions, chit-chat, explanations or code.
Order: first gather/know the facts, then write at most one short sentence, then the ui block last. Never repeat the block's content as text. Labels in the user's language.
Spec: {"title":str,"subtitle"?:str,"blocks":[...],"submit"?:{"label":str}}
Block types (only these):
{"type":"choice","id","label","options":[str],"multi"?:bool}
{"type":"slider","id","label","min":num,"max":num,"step"?:num,"unit"?:str,"default"?:num}
{"type":"number","id","label","min"?,"max"?,"default"?}
{"type":"date","id","label"}
{"type":"text","id","label","placeholder"?}
{"type":"cards","items":[{"title","subtitle"?,"meta"?,"price"?,"action"?}]}
{"type":"table","columns":[str],"rows":[[str|num]]}
{"type":"chart","label"?,"unit"?,"items":[{"label","value":num}]}
{"type":"stats","items":[{"label","value"}]}
{"type":"steps","items":[str]}
{"type":"note","text"}
{"type":"buttons","items":[{"label","action"?}]}
When inputs exist add "submit". The user's choices come back to you as a message listing each label and value; then deliver the real answer right away (e.g. the full itinerary with cards/table/stats). Never ask for the same fields again; assume sensible defaults for anything left empty.
Example — user: "I want to travel to Egypt":
Let's tailor your trip.
\`\`\`ui
{"title":"Plan your Egypt trip","blocks":[{"type":"slider","id":"budget","label":"Budget","min":300,"max":5000,"step":100,"unit":"USD","default":1500},{"type":"number","id":"days","label":"Days","min":2,"max":30,"default":7},{"type":"choice","id":"style","label":"Trip style","options":["Historic","Beach","Desert","Nile cruise"],"multi":true},{"type":"date","id":"start","label":"Start date"}],"submit":{"label":"Suggest my trip"}}
\`\`\``;
