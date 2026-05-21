import { auth } from './index';

export async function requireAdmin(): Promise<{ ok: true; userId: number } | { ok: false }> {
  const session = await auth();
  const roles = (session?.user?.roles ?? []) as string[];
  if (!session?.user?.id || !roles.includes('ADMIN')) return { ok: false };
  return { ok: true, userId: parseInt(session.user.id) };
}
