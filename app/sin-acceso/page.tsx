'use client';
import { useClerk } from '@clerk/nextjs';

export default function SinAcceso() {
  const { signOut } = useClerk();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#271033] text-white flex-col gap-6">
      <h1 className="text-3xl font-bold text-[#C392DD]">Acceso denegado</h1>
      <p className="text-[#FBDAF9]">Tu cuenta no tiene acceso a esta aplicación.</p>
      <button
        onClick={() => signOut({ redirectUrl: '/sign-in' })}
        className="px-6 py-2 bg-[#F500F1] text-white rounded-lg font-semibold hover:bg-[#c400c0] transition-colors cursor-pointer"      >
        Volver
      </button>
    </main>
  );
}