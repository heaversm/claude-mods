import { expect, test } from 'claude-code/testing'

const BAND = { component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 80 } as never } as const

test('/pin adds a pin to the band, × removes it', async ($, on) => {
  on('clock.now', () => ({ value: 1000 }))
  on('ui.selection', () => ({ value: undefined }))
  const ui = await $.ui.mount({ plugin: 'pins', surface: 'terminal', ...BAND })
  expect(await ui.find({ key: 'pin-selection' })).toBeDefined()
  const ran = await $.command.run({ command: 'pin', args: 'keep this in view' })
  expect(ran.text).toBe('Pinned.')
  expect(await ui.find({ type: 'Text', text: /keep this in view/ })).toBeDefined()
  const x = (await ui.findAll({ type: 'Button' })).find(b => String(b.key).startsWith('x-'))
  expect(x).toBeDefined()
  await ui.press({ key: String(x!.key) })
  expect(await ui.find({ type: 'Text', text: /keep this in view/ })).toBeUndefined()
  await ui.unmount()
})

test('the pin button pins the highlighted text', async ($, on) => {
  on('clock.now', () => ({ value: 2000 }))
  on('ui.selection', () => ({ value: { text: 'highlighted bit' } }))
  const ui = await $.ui.mount({ plugin: 'pins', surface: 'terminal', ...BAND })
  await ui.press({ key: 'pin-selection' })
  expect(await ui.find({ type: 'Text', text: /highlighted bit/ })).toBeDefined()
  await ui.unmount()
})

test('/pin with nothing highlighted or typed says so', async ($, on) => {
  on('ui.selection', () => ({ value: undefined }))
  const ran = await $.command.run({ command: 'pin' })
  expect(ran.text).toMatch(/Nothing to pin/)
})
