import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Pin } from '../types'

// Pins live for this session only.
const pins = atom({ plugin: 'pins', key: 'items' } as const, [])
const expanded = atom({ plugin: 'pins', key: 'expanded' } as const, null)

/** Characters a collapsed pin shows; a click on it shows the whole text. */
const PREVIEW = 140

/** Pins the person's last highlighted text, or `typed` when given. Says what happened. */
async function pin($: EngineInterface, typed?: string): Promise<string> {
  const text = typed?.trim() || (await $.ui.selection())?.text.trim()
  if (!text) {
    return 'Nothing to pin: highlight some text first, or type it after /pin. (Reading a highlight needs the fullscreen layout.)'
  }
  const id = String(await $.clock.now())
  await update($, pins, list => [...list, { id, text }])
  return 'Pinned.'
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'pin', description: 'Pin your highlighted text, or the text after /pin, above the prompt' })
    await $.command.register({ name: 'unpin', description: 'Clear all pins' })
    return next(e)
  })

  on('command.run', { command: 'pin' }, async ($, e) => ({ text: await pin($, e.args) }))

  on('command.run', { command: 'unpin' }, async $ => {
    await update($, pins, () => [])
    return { text: 'Pins cleared.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    const list: Pin[] = await read($, pins)
    const open = await read($, expanded)
    const { Box, Button, Text } = $.ui.resolve(e)

    const add = (
      <Button
        key="pin-selection"
        plain
        label="📌 pin selection"
        onPress={async () => {
          const said = await pin($)
          if (said !== 'Pinned.') $.ui.toast(said)
        }}
      />
    )

    return (
      <Box flexDirection="column">
        {list.map(p => {
          const isOpen = open === p.id
          const short = p.text.length > PREVIEW && !isOpen
          const shown = short ? `${p.text.slice(0, PREVIEW).replace(/\s+/g, ' ')}…` : p.text
          return (
            <Box flexDirection="row">
              <Button key={`x-${p.id}`} plain label="×" onPress={() => update($, pins, all => all.filter(o => o.id !== p.id))} />
              <Text> </Text>
              {p.text.length > PREVIEW ? (
                <Button key={`open-${p.id}`} plain onPress={() => update($, expanded, cur => (cur === p.id ? null : p.id))}>
                  {shown}
                </Button>
              ) : (
                <Text>{shown}</Text>
              )}
            </Box>
          )
        })}
        {add}
      </Box>
    )
  })
}
