import type { PluginAiGenerateRequest, PluginAiStatus, PluginPublicFetchRequest, PluginPublicFetchResponse } from '@edgeever/shared';

type Request = <T>(path: string, init?: RequestInit) => Promise<T>;
export function createPluginCapabilities(request: Request) {
  return {
    pluginAi: {
      status: () => request<PluginAiStatus>('/api/v1/plugins/ai/status'),
      generate: ({ signal, ...input }: PluginAiGenerateRequest & { signal?: AbortSignal }) => request<{ text: string }>('/api/v1/plugins/ai/generate', { method: 'POST', body: JSON.stringify(input), signal }),
    },
    pluginNetwork: {
      fetchPublic: (input: PluginPublicFetchRequest, options?: { signal?: AbortSignal }) => request<PluginPublicFetchResponse>('/api/v1/plugins/network/fetch', { method: 'POST', body: JSON.stringify(input), signal: options?.signal }),
    },
  };
}
