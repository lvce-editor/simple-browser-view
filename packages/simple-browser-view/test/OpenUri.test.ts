import { beforeEach, expect, jest, test } from '@jest/globals'

beforeEach(() => {
  jest.resetAllMocks()
})

jest.unstable_mockModule('../src/parts/ParentRpc/ParentRpc.ts', () => {
  return {
    invoke: jest.fn(() => {
      throw new Error('not implemented')
    }),
  }
})

const OpenUri = await import('../src/parts/OpenUri/OpenUri.ts')
const Rpc = await import('../src/parts/ParentRpc/ParentRpc.ts')

test('openUri - without options', async () => {
  // @ts-ignore
  Rpc.invoke.mockResolvedValue(undefined)
  await OpenUri.openUri('/test/file.txt')
  expect(Rpc.invoke).toHaveBeenCalledTimes(1)
  expect(Rpc.invoke).toHaveBeenCalledWith('Main.openUri', '/test/file.txt', true, {})
})

test('openUri - with preview', async () => {
  // @ts-ignore
  Rpc.invoke.mockImplementation(() => {})
  await OpenUri.openUri('/test/file.txt', true)
  expect(Rpc.invoke).toHaveBeenCalledTimes(1)
  expect(Rpc.invoke).toHaveBeenCalledWith('Main.openUri', '/test/file.txt', true, {})
})

test('openUri - with options', async () => {
  // @ts-ignore
  Rpc.invoke.mockImplementation(() => {})
  const options = {
    selections: new Uint32Array([1, 0, 1, 0]),
  }
  await OpenUri.openUri('/test/file.txt', false, options)
  expect(Rpc.invoke).toHaveBeenCalledTimes(1)
  expect(Rpc.invoke).toHaveBeenCalledWith('Main.openUri', '/test/file.txt', false, options)
})

test('openUri - error', async () => {
  // @ts-ignore
  Rpc.invoke.mockImplementation(() => {
    throw new Error('Failed to open file')
  })
  await expect(OpenUri.openUri('/test/file.txt')).rejects.toThrow('Failed to open file')
})
