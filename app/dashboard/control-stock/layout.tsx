import { requireMenuAccess } from '@/lib/auth/check-menu-access';

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireMenuAccess('/dashboard/control-stock');
  return <>{children}</>;
}
