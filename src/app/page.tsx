import { redirect } from 'next/navigation';

export default function HomePage() {
  // No login, no signup, no authentication.
  // Direct entry into main citizen dashboard.
  redirect('/dashboard');
}
