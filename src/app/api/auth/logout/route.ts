import kv from '@/lib/kv';
import redis from '@/lib/redis';
import { parseRequest } from '@/lib/request';
import { ok } from '@/lib/response';

export async function POST(request: Request) {
  const { auth } = await parseRequest(request);

  if (auth?.authKey) {
    if (redis.enabled) {
      await redis.client.del(auth.authKey);
    } else if (kv.enabled) {
      await kv.delete(auth.authKey);
    }
  }

  return ok();
}
