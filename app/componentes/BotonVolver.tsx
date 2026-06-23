
import Link from 'next/link';

export default function BotonVolver({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-[#C392DD] hover:text-white transition-colors text-sm font-medium mb-6"
    >
      ← Volver
    </Link>
  );
}