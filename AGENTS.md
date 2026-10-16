<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Generative UI: chat models answer with a ```ui JSON block validated by src/components/chat/genui/schema.ts and rendered by GenUIBlock; the prompt lives in genui/prompt.ts and is copied into supabase/functions/_shared/genui.ts (used by chat-fast and chat-alibaba; Deno cannot import src) — keep both in sync. ui blocks render outside the markdown pipeline so math/sanitize plugins cannot break them.
- Chat HTML widgets: ```widget blocks render in a sandboxed iframe (allow-scripts only) via genui/HtmlWidget.tsx with a built-in stylesheet; replies go back through megsy.send/postMessage. Why: rich model-drawn UI without access to the app session.
