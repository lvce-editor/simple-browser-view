import { execa } from 'execa'
import { root } from './root.js'
import { getDevApplicationCommand } from './getDevApplicationCommand.js'
import { waitForDevProcesses } from './waitForDevProcesses.js'

const main = async () => {
  await execa('npm', ['run', 'build'], {
    cwd: root,
    stdio: 'inherit',
  })
  const watcher = execa('npm', ['run', 'build:watch'], {
    cwd: root,
    stdio: 'inherit',
  })
  const { command, args, cwd } = getDevApplicationCommand(root)
  const application = execa(command, args, {
    cwd,
    stdio: 'inherit',
  })
  await waitForDevProcesses({ application, watcher })
}

await main()
