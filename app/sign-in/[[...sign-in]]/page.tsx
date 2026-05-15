
import { SignIn } from '@clerk/nextjs';

export default function PaginaLogin() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#271033]">
      <SignIn fallbackRedirectUrl="/" />
    </main>
  );
}