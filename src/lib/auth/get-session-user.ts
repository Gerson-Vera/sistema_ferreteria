import { auth } from './index';
import db from '@/lib/db';

/**
 * Returns the authenticated user's DB id, or null if the session is missing
 * or the user no longer exists in the database (e.g. after a seed re-run).
 */
export async function getSessionUsuarioId(): Promise<number | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const id = parseInt(session.user.id);
  if (isNaN(id)) return null;
  const usuario = await db.usuario.findUnique({ where: { id, estado: true } });
  return usuario ? id : null;
}
