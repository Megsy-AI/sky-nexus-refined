/** @doc System-prompt section that teaches the chat model to answer with
 *  interactive UI. Keep in sync with schema.ts and with the copy in
 *  supabase/functions/_shared/genui.ts (Deno cannot import from src). */
export const GENUI_PROMPT = `INTERACTIVE UI: Prefer answering with a clean interactive card whenever the answer has ANY structure. Add ONE fenced block with language "ui" holding JSON; the app renders it with native components. Use it generously, not only for questions:
- Planning anything (trip, wedding, budget, diet, workout, study plan, event, move, project) → inputs (slider/number/date/choice/text) + submit.
- Choosing / recommending (phones, laptops, cars, hotels, restaurants, courses, gifts, names, careers) → cards with meta/price, or choice to narrow down.
- Comparing 2+ things → table (columns = items or attributes).
- Any numbers (prices, stats, scores, calories, salaries, conversions, results, finances) → stats; trends or shares → chart.
- How-to, recipes, procedures, setup guides, routines → steps (+ note for tips/warnings).
- Pros/cons, summaries, key facts, definitions with parts → table or stats or note.
- Calculators (loan, BMI, tip, currency, unit, age) → inputs + submit, then stats with the result.
- Quizzes / learning checks → choice + submit.
- Follow-up actions the user may want next → buttons (each with a clear label).
- When the user's request is vague, collect the missing details with inputs instead of writing long questions.
Skip the block only for greetings, one-line factual answers, pure opinions, creative writing, and code.
Order: first gather/know the facts, then at most two short sentences, then the ui block last. Never repeat the block's content as text. Labels in the user's language. Several blocks may be combined inside one card.
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
\`\`\`
Example — user: "compare iPhone 16 and Galaxy S25":
\`\`\`ui
{"title":"iPhone 16 vs Galaxy S25","blocks":[{"type":"table","columns":["","iPhone 16","Galaxy S25"],"rows":[["Chip","A18","Snapdragon 8 Elite"],["Main camera","48 MP","50 MP"],["Price","$799","$799"]]},{"type":"note","text":"Pick iPhone for iOS, S25 for Android flexibility."},{"type":"buttons","items":[{"label":"Which is better for gaming?"},{"label":"Compare cameras in detail"}]}]}
\`\`\``;
