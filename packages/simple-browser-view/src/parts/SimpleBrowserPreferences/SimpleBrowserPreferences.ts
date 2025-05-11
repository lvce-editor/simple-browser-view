import * as Preferences from '../Preferences/Preferences.ts'

export const getDefaultUrl = (): string => {
  return 'https://example.com'
}

export const getShortCuts = async (): Promise<readonly any[]> => {
  const pref = await Preferences.get('simpleBrowser.shortcuts')
  const shortcuts = pref || []
  return shortcuts
}
