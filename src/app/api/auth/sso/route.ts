import { saveAuth } from '@/lib/auth';
import kv from '@/lib/kv';
import redis from '@/lib/redis';
import { parseRequest } from '@/lib/request';
import { json } from '@/lib/response';

export async function POST(request: Request) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  if (redis.enabled || kv.enabled) {
    const token = await saveAuth({ userId: auth.user.id }, 86400);

    return json({ user: auth.user, token });
  }
}
