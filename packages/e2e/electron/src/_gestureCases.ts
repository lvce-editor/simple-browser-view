import type { ElectronTestContext } from './_responseTest.ts'
import * as Fixture from './_browserFixture.ts'

export const run = async (context: ElectronTestContext, scenario: string): Promise<void> => {
  const fixture = await Fixture.start(context)
  const { electronApp, expect, page } = fixture
  try {
    const startedAt = await electronApp.evaluate(({ BrowserWindow }, action) => {
      const window = BrowserWindow.getAllWindows()[0]
      window.focus()
      const target = window.webContents
      target.focus()
      const down = (): void => target.sendInputEvent({ keyCode: 'Control', type: 'keyDown' })
      const up = (): void => target.sendInputEvent({ keyCode: 'Control', type: 'keyUp' })
      const tap = (): void => {
        down()
        up()
      }
      switch (action) {
        case 'copy-paste': {
          for (const keyCode of ['C', 'V']) {
            down()
            target.sendInputEvent({ keyCode, modifiers: ['control'], type: 'keyDown' })
            target.sendInputEvent({ keyCode, modifiers: ['control'], type: 'keyUp' })
            up()
          }

          break
        }
        case 'expired-gap': {
          tap()
          return Date.now()
        }
        case 'held-control': {
          down()
          return Date.now()
        }
        case 'intervening-key': {
          tap()
          target.sendInputEvent({ keyCode: 'A', type: 'keyDown' })
          target.sendInputEvent({ keyCode: 'A', type: 'keyUp' })
          tap()

          break
        }
        case 'mouse-cancels': {
          tap()
          target.sendInputEvent({ button: 'left', clickCount: 1, type: 'mouseDown', x: 300, y: 200 })
          target.sendInputEvent({ button: 'left', clickCount: 1, type: 'mouseUp', x: 300, y: 200 })
          tap()

          break
        }
        // No default
      }
      return Date.now()
    }, scenario)
    if (scenario === 'expired-gap') {
      await expect.poll(() => Date.now()).toBeGreaterThan(startedAt + 450)
      await electronApp.evaluate(({ BrowserWindow }) => {
        const target = BrowserWindow.getAllWindows()[0].webContents
        target.sendInputEvent({ keyCode: 'Control', type: 'keyDown' })
        target.sendInputEvent({ keyCode: 'Control', type: 'keyUp' })
      })
    } else if (scenario === 'held-control') {
      await expect.poll(() => Date.now()).toBeGreaterThan(startedAt + 300)
      await electronApp.evaluate(({ BrowserWindow }) => {
        const target = BrowserWindow.getAllWindows()[0].webContents
        target.sendInputEvent({ keyCode: 'Control', type: 'keyUp' })
        target.sendInputEvent({ keyCode: 'Control', type: 'keyDown' })
        target.sendInputEvent({ keyCode: 'Control', type: 'keyUp' })
      })
    }
    // These cases verify the gesture recognition window itself, so elapsed time is the observed condition.
    const quietPeriodEnds = Date.now() + 450
    await expect.poll(() => Date.now()).toBeGreaterThan(quietPeriodEnds)
    const locator1 = page.locator('.BrowserFullWidth')
    await expect(locator1).toHaveCount(0)
    await Fixture.gesture(context)
    const locator2 = page.locator('.BrowserFullWidth')
    await expect(locator2).toHaveCount(1)
  } finally {
    await fixture.close()
  }
}
