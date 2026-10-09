import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

if (!process.env.LVCE_SOURCE_ROOT) throw new Error('Set LVCE_SOURCE_ROOT to the installed LVCE application fixture')
export const root = resolve(process.env.LVCE_SOURCE_ROOT)
export const fixtureUrl = pathToFileURL(root + '/')
