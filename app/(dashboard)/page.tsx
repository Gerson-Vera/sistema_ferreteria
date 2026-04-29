import { redirect } from 'next/navigation';

// Este archivo existe por la estructura de route groups.
// El dashboard real está en app/dashboard/
export default function Page() {
  redirect('/dashboard');
}
