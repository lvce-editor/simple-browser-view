import { join } from 'node:path'

export const getDevApplicationCommand = (root, executablePath = process.env.LVCE_EXECUTABLE_PATH || 'lvce') => {
  return {
    args: ['--link', join(root, '.tmp', 'dist'), '--hot-reload', '--wait', root],
    command: executablePath,
    cwd: root,
  }
}
