'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', roles: ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'PEDAGOGO'] },
  { name: 'Alunos', href: '/dashboard/alunos', roles: ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'PEDAGOGO'] },
  { name: 'Avaliações', href: '/dashboard/avaliacoes', roles: ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'PEDAGOGO'] },
  { name: 'Usuários', href: '/dashboard/usuarios', roles: ['ADMIN'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="flex h-screen flex-col bg-gray-800 w-64">
      <div className="flex h-16 items-center justify-center border-b border-gray-700">
        <h1 className="text-xl font-semibold text-white">PAA Dashboard</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="px-2 py-4">
          {navigation
            .filter((item) => item.roles.includes(session.user.tipo))
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mb-1 flex items-center rounded-lg px-4 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
        </nav>
      </div>

      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">
              {session.user.nome}
            </p>
            <p className="text-xs text-gray-400">{session.user.tipo}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="text-sm text-gray-400 hover:text-white"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
