import type { ElectronTestContext } from './_responseTest.ts'
import * as SimpleBrowser from './_simpleBrowser.ts'

export const name = 'simple-browser.audio-tab-indicator'

const createTone = (): Buffer => {
  const sampleRate = 8000
  const sampleCount = sampleRate
  const buffer = Buffer.alloc(44 + sampleCount * 2)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + sampleCount * 2, 4)
  buffer.write('WAVEfmt ', 8)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(sampleCount * 2, 40)
  for (let index = 0; index < sampleCount; index++) {
    const sample = Math.sin((2 * Math.PI * 440 * index) / sampleRate)
    buffer.writeInt16LE(Math.round(sample * 12_000), 44 + index * 2)
  }
  return buffer
}

const page = `<!doctype html>
<html>
  <head><title>Audio fixture</title></head>
  <body>
    <audio id="audio" loop src="TONE_URL"></audio>
    <button id="play">Play</button>
    <button id="stop">Stop</button>
    <script>
      const audio = document.querySelector('#audio')
      document.querySelector('#play').addEventListener('click', async () => {
        await audio.play()
        document.body.dataset.audioState = audio.paused ? 'paused' : 'playing'
      })
      document.querySelector('#stop').addEventListener('click', () => {
        audio.pause()
      })
    </script>
  </body>
</html>`

export const test = async ({ expect, page: editorPage }: ElectronTestContext): Promise<void> => {
  const tone = createTone()
  await SimpleBrowser.show(editorPage)
  const context = editorPage.context()
  await expect.poll(() => context.pages().length).toBeGreaterThan(1)
  const webContentsPage = context.pages().find((candidate) => candidate !== editorPage)
  if (!webContentsPage) {
    throw new Error('Simple Browser WebContentsView was not created')
  }
  const toneUrl = `data:audio/wav;base64,${tone.toString('base64')}`
  await webContentsPage.setContent(page.replace('TONE_URL', () => toneUrl))
  const audioIndicator = editorPage.locator('.SimpleBrowserTabAudio')

  // eslint-disable-next-line e2e/no-direct-click -- supplies the user gesture required to start media playback
  await webContentsPage.getByRole('button', { name: 'Play' }).click()
  await expect(webContentsPage.locator('body')).toHaveAttribute('data-audio-state', 'playing')
  await expect(audioIndicator).toBeVisible()
  await expect(audioIndicator).toHaveAttribute('title', 'This tab is playing audio')

  // eslint-disable-next-line e2e/no-direct-click -- stops playback in the embedded page
  await webContentsPage.getByRole('button', { name: 'Stop' }).click()
  await expect(audioIndicator).toBeHidden()
}
