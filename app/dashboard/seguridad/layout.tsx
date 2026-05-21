import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function SeguridadLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const roles = (session?.user?.roles as string[] | undefined) ?? [];
  if (!roles.includes('ADMIN')) redirect('/dashboard?error=forbidden');
  return <>{children}</>;
}
