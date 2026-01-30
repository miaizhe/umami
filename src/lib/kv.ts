const enabled = !!process.env.EDGEONE_KV_ID;

async function getClient() {
  const binding = process.env.EDGEONE_KV_NAME || 'EDGEONE_PAGES_KV';
  if (typeof globalThis[binding] !== 'undefined') {
    return globalThis[binding];
  }
  return null;
}

const kv = {
  enabled,
  get: async (key: string) => {
    const client = await getClient();
    if (client) {
      const value = await client.get(key);
      if (value) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
    }
    return null;
  },
  set: async (key: string, value: any, options?: { expirationTtl?: number }) => {
    const client = await getClient();
    if (client) {
      const val = typeof value === 'string' ? value : JSON.stringify(value);
      return client.put(key, val, options);
    }
  },
  delete: async (key: string) => {
    const client = await getClient();
    if (client) {
      return client.delete(key);
    }
  },
  fetch: async (key: string, callback: () => Promise<any>, expire?: number) => {
    const value = await kv.get(key);
    if (value) {
      return value;
    }
    const result = await callback();
    if (result) {
      await kv.set(key, result, expire ? { expirationTtl: expire } : undefined);
    }
    return result;
  },
};

export default kv;
