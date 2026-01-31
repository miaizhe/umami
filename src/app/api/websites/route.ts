import { z } from 'zod';
import { uuid } from '@/lib/crypto';
import redis from '@/lib/redis';
import { getQueryFilters, parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams } from '@/lib/schema';
import { canCreateWebsite } from '@/permissions';
import { createWebsite, getWebsiteCount } from '@/queries/prisma';
import { getUserWebsites } from '@/queries/prisma/website';

const CLOUD_WEBSITE_LIMIT = 3;

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const userId = auth.user.id;

  const filters = await getQueryFilters(query);

  return json(await getUserWebsites(userId, filters));
}

export async function POST(request: Request) {
  const schema = z.object({
    name: z.string().max(100),
    domain: z.string().max(500),
    shareId: z.string().max(50).nullable().optional(),
    id: z.uuid().nullable().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { id, name, domain, shareId } = body;

  if (process.env.CLOUD_MODE) {
    const account = await redis.client.get(`account:${auth.user.id}`);

    if (!account?.hasSubscription) {
      const count = await getWebsiteCount(auth.user.id);

      if (count >= CLOUD_WEBSITE_LIMIT) {
        return unauthorized({ message: 'Website limit reached.' });
      }
    }
  }

  if (!(await canCreateWebsite(auth))) {
    return unauthorized();
  }

  const data: any = {
    id: id ?? uuid(),
    createdBy: auth.user.id,
    name,
    domain,
    shareId,
    userId: auth.user.id,
  };

  const website = await createWebsite(data);

  return json(website);
}
