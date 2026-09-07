import type { ElectronTestContext } from './_responseTest.ts'
import * as Fixture from './_browserFixture.ts'

export const run = async (context: ElectronTestContext, scenario: string): Promise<void> => {
  const fixture = await Fixture.start(context)
  const { electronApp, expect, page } = fixture
  try {
    await electronApp.evaluate(async ({ BrowserWindow }, action) => {
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
      // eslint-disable-next-line unicorn/consistent-function-scoping -- this timer executes in the isolated Electron main process
      const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))
      switch (action) {
      case 'copy-paste': {
        for (const keyCode of ['C', 'V']) {
          down()
          target.sendInputEvent({ keyCode, modifiers: ['control'], type: 'keyDown' })
          target.sendInputEvent({ keyCode, modifiers: ['control'], type: 'keyUp' })
          up()
        }
      
      break;
      }
      case 'expired-gap': {
        tap()
        await wait(450)
        tap()
      
      break;
      }
      case 'held-control': {
        down()
        await wait(300)
        up()
        tap()
      
      break;
      }
      case 'intervening-key': {
        tap()
        target.sendInputEvent({ keyCode: 'A', type: 'keyDown' })
        target.sendInputEvent({ keyCode: 'A', type: 'keyUp' })
        tap()
      
      break;
      }
      case 'mouse-cancels': {
        tap()
        target.sendInputEvent({ button: 'left', clickCount: 1, type: 'mouseDown', x: 12, y: 12 })
        target.sendInputEvent({ button: 'left', clickCount: 1, type: 'mouseUp', x: 12, y: 12 })
        tap()
      
      break;
      }
      // No default
      }
      // Wait beyond the recognition interval before asserting a negative result.
      await wait(450)
    }, scenario)
    await expect(page.locator('.BrowserFullWidth')).toHaveCount(0)
    await Fixture.gesture(context)
    await expect(page.locator('.BrowserFullWidth')).toHaveCount(1)
  } finally {
    await fixture.close()
  }
}
