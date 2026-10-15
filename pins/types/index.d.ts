export type Pin = { id: string; text: string }

declare module 'claude-code' {
  interface PluginState {
    pins: { items: Pin[]; expanded: string | null }
  }
}
