"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';

export default function Header() {
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { user } = useUser();

  // Determinamos si estamos en la sección de administración
  const isAdmin = pathname.startsWith('/admin');

  // Definimos los links dinámicamente
  const links = isAdmin 
    ? [
        { href: '/admin', label: 'Inicio' },
        { href: '/admin/promociones', label: 'Promociones' },
        { href: '/admin/historial', label: 'Historial' },
      ]
    : [
        { href: '/', label: 'Inicio' },
        { href: '/promociones', label: 'Promociones' },
        { href: '/historial', label: 'Historial' },
      ];

  return (
    <header className="w-full px-4 md:px-8 py-6 bg-[#1f0627] border-b border-[#8D62A5]">
      <div className="flex items-center justify-between">
        <Link href={isAdmin ? "/admin" : "/"}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight hover:opacity-80 transition-opacity cursor-pointer">
            RepairDash {isAdmin && <span className="text-xs bg-[#F500F1] text-white px-2 py-0.5 rounded align-middle ml-2">ADMIN</span>}
          </h1>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-base font-medium transition-colors px-4 ${
                pathname === link.href
                  ? 'text-[#F500F1]'
                  : 'text-[#FBDAF9] hover:text-[#F500F1]'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Usuario + cerrar sesión */}
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[#8D62A5]">
            {user && (
              <span className="text-[#FBDAF9] text-sm">
                {user.firstName ?? user.emailAddresses[0].emailAddress}
              </span>
            )}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                }
              }}
            />
          </div>
        </nav>

        {/* Mobile - botón hamburguesa + avatar */}
        <div className="md:hidden flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              }
            }}
          />
          <button
            className="text-[#FBDAF9] p-2"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label="Menú"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={menuAbierto ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile - menú desplegable */}
      {menuAbierto && (
        <nav className="md:hidden mt-4 flex flex-col gap-4 px-4">
          {user && (
            <span className="text-[#FBDAF9] text-sm border-b border-[#8D62A5] pb-3">
              {user.firstName ?? user.emailAddresses[0].emailAddress}
            </span>
          )}
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuAbierto(false)}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-[#F500F1]'
                  : 'text-[#FBDAF9] hover:text-[#F500F1]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}