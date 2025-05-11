import { expect, test } from '@jest/globals'
import * as ParentRpc from '../src/parts/ParentRpc/ParentRpc.ts'

test('invoke - successfully invokes command', async () => {
  const mockRpc = {
    invoke(): string {
      return 'test result'
    },
  } as any
  ParentRpc.set(mockRpc)
  // @ts-expect-error
  const result = await ParentRpc.invoke('test.command', 'arg1', 'arg2')
  expect(result).toBe('test result')
})

test('invoke - handles error from rpc', async () => {
  const mockRpc = {
    async invoke(): Promise<void> {
      throw new Error('test error')
    },
  } as any
  ParentRpc.set(mockRpc)
  // @ts-expect-error
  await expect(ParentRpc.invoke('test.command')).rejects.toThrow('test error')
})

test('invoke - handles undefined arguments', async () => {
  const mockRpc = {
    invoke(): string {
      return 'success'
    },
  } as any
  ParentRpc.set(mockRpc)
  // @ts-ignore
  const result = await ParentRpc.invoke('test.command')
  expect(result).toBe('success')
})

test('invoke - handles multiple arguments of different types', async () => {
  let capturedArgs: readonly any[] = []
  const mockRpc = {
    invoke(command: string, ...args: readonly any[]): string {
      capturedArgs = args
      return 'success'
    },
  } as any
  ParentRpc.set(mockRpc)
  const args = [1, 'string', true, { key: 'value' }, [1, 2, 3]]
  // @ts-ignore
  await ParentRpc.invoke('test.command', ...args)
  expect(capturedArgs).toEqual(args)
})

test('invokeAndTransfer - successfully transfers data', async () => {
  const mockRpc = {
    invokeAndTransfer(): string {
      return 'transfer success'
    },
  } as any
  ParentRpc.set(mockRpc)
  // @ts-expect-error
  const result = await ParentRpc.invokeAndTransfer('test.transfer', 'data')
  expect(result).toBe('transfer success')
})

test('invokeAndTransfer - handles transfer error', async () => {
  const mockRpc = {
    async invokeAndTransfer(): Promise<void> {
      throw new Error('transfer failed')
    },
  } as any
  ParentRpc.set(mockRpc)
  // @ts-expect-error
  await expect(ParentRpc.invokeAndTransfer('test.transfer')).rejects.toThrow('transfer failed')
})
