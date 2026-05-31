import BotonVolver from '@/app/componentes/BotonVolver';
import { SignIn } from '@clerk/nextjs';

export default function PaginaLogin() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#271033]">
      <div className="relative">
        <div className="absolute -top-12 left-0">        
          <BotonVolver href="/" />
        </div>
      <SignIn
        fallbackRedirectUrl="/"
        transferable={false}
        withSignUp={false}
      />
      </div>
    </main>
  );
}