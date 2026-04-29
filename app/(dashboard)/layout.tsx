// Layout del route group (dashboard) - pass-through.
// El layout real con Sidebar/Navbar está en app/dashboard/layout.tsx
export default function GroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
