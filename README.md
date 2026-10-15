# my-mods

Claude Code mods. Early access: the mod API may change between Claude Code releases.

## pins

Keep bits of the conversation in view while you scroll. Highlight text in the transcript and click **📌 pin selection** above the prompt; the text stays in a band with a **×** to remove it. Long pins show the first 140 characters; click to expand.

- `/pin` pins your current highlight, or the text after it: `/pin npm run demo`
- `/unpin` clears all pins
- Pins last for the session.

Reading a highlight needs Claude Code's fullscreen layout (the default outside tmux). Without it, use `/pin <text>`.

### Install

At the Claude Code prompt:

```
/plugin install pins --marketplace heaversm/claude-mods
```

Answer `y` to add the marketplace, then pick the user scope.
