import { beforeEach, expect, jest, test } from '@jest/globals'
import * as RpcId from '../src/parts/RpcId/RpcId.ts'

const mockRpc = {
  invoke: jest.fn(),
}

const mockWebWorkerRpcClient = {
  create: jest.fn(),
}

beforeEach(() => {
  jest.resetAllMocks()
})

jest.unstable_mockModule('@lvce-editor/rpc', () => {
  return {
    WebWorkerRpcClient: mockWebWorkerRpcClient,
    WebSocketRpcParent: mockWebWorkerRpcClient,
    MessagePortRpcParent: mockWebWorkerRpcClient,
  }
})

const Listen = await import('../src/parts/Listen/Listen.ts')
const RpcRegistry = await import('../src/parts/RpcRegistry/RpcRegistry.ts')

test('listen - creates rpc client and sets it', async () => {
  // @ts-ignore
  mockWebWorkerRpcClient.create.mockResolvedValue(mockRpc)

  await Listen.listen()

  expect(mockWebWorkerRpcClient.create).toHaveBeenCalledWith({
    commandMap: expect.any(Object),
  })
  expect(RpcRegistry.get(RpcId.RendererWorker)).toBeDefined()
})
