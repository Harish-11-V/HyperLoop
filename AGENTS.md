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

- UI never calls fetch directly; all data goes through `src/services/*` gated by `DEMO_MODE` — so mock data can be swapped for the FastAPI backend without UI changes.
- App pages live under the `_shell` pathless layout which hosts the sidebar/topbar and shared app state.
