import * as Character from '../Character/Character.ts'

const isValidHttpUrl = (string: string): boolean => {
  if (!string.startsWith('http:') && !string.startsWith('https:')) {
    return false
  }
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const createUrl = (baseUrl: string, params: any): string => {
  return baseUrl + '?' + new URLSearchParams(params).toString()
}

const createSearchUrlWithGoogle = (input: string): string => {
  const searchUrl = 'https://www.google.com/search'
  const params = {
    q: input,
  }
  return createUrl(searchUrl, params)
}

// TODO add preference option for search engine
const createSearchUrl = (input: string): string => {
  return createSearchUrlWithGoogle(input)
}

const isValidFileUrl = (input: string): boolean => {
  return input.startsWith('file://')
}

const isValidFilePath = (input: string): boolean => {
  return input.startsWith(Character.Slash)
}

const isLocalHostUrlWithOutHttp = (input: string): boolean => {
  return input.startsWith('localhost:')
}

export const toIframeSrc = (input: string, shortcuts: readonly any[] = []): string => {
  for (const shortcut of shortcuts) {
    if (shortcut && shortcut.prefix === input && typeof shortcut.url === 'string') {
      return shortcut.url
    }
  }
  if (isValidHttpUrl(input) || isValidFileUrl(input)) {
    return input
  }
  if (isLocalHostUrlWithOutHttp(input)) {
    return `http://${input}`
  }
  if (isValidFilePath(input)) {
    return 'file://' + input
  }
  const dotIndex = input.indexOf(Character.Dot)
  if (dotIndex !== -1 && dotIndex !== input.length - 1) {
    return 'https://' + input
  }
  return createSearchUrl(input)
}
