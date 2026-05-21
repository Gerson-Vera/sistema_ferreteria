import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

/**
 * Verifica en BD si el usuario tiene acceso al menú con la URL dada.
 * - ADMIN: siempre tiene acceso.
 * - Otros: se consulta menuRol en tiempo real → cualquier cambio aplica inmediatamente.
 * Si no tiene acceso → redirect a /dashboard?error=forbidden.
 */
export async function requireMenuAccess(menuUrl: string): Promise<void> {
  const session = await auth();
  const roles = (session?.user?.roles as string[] | undefined) ?? [];

  // Admin tiene acceso total
  if (roles.includes('ADMIN')) return;

  const access = await db.menuRol.findFirst({
    where: {
      estado: true,
      rol:    { codigo: { in: roles }, estado: true },
      menu:   { url: menuUrl, estado: true },
    },
  });

  if (!access) redirect('/dashboard?error=forbidden');
}
