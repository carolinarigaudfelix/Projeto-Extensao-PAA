'use client';

import { useRoleGuard } from '@/lib/route-guard';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useId, useState } from 'react';

interface UsuarioDetalhe {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  cpf: string;
  atualizado: string;
  isActive: boolean;
}

const tiposValidos = ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'PEDAGOGO'] as const;

export default function EditarUsuarioPage() {
  const { isLoading, isAuthenticated, hasRole } = useRoleGuard(['ADMIN']);
  const params = useParams();
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const nomeId = useId();
  const emailId = useId();
  const tipoId = useId();
  const cpfId = useId();

  const userId = Array.isArray(params?.id)
    ? params.id[0]
    : (params?.id as string | undefined);

  useEffect(() => {
    if (!userId) return;
    if (!hasRole) return;
    async function load() {
      try {
        const res = await fetch(`/api/usuarios/${userId}`);
        if (!res.ok) throw new Error('Falha ao carregar usuário');
        const data = await res.json();
        setUsuario(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro inesperado');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId, hasRole]);

  async function onSubmit(formData: FormData) {
    if (!userId) return;
    setError('');
    setSaving(true);
    try {
      const entries = Object.fromEntries(formData.entries());
      const payload: Record<string, unknown> = {};
      if (entries.nome && entries.nome !== usuario?.nome)
        payload.nome = entries.nome;
      if (entries.email && entries.email !== usuario?.email)
        payload.email = entries.email;
      if (entries.tipo && entries.tipo !== usuario?.tipo)
        payload.tipo = entries.tipo;
      if (entries.cpf && entries.cpf !== usuario?.cpf)
        payload.cpf = entries.cpf;

      const res = await fetch(`/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || 'Falha ao salvar');
        return;
      }
      router.push('/dashboard/usuarios');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <p className="text-sm text-gray-500">Carregando...</p>;
  if (!isAuthenticated)
    return (
      <p className="text-sm text-red-600">Você precisa estar autenticado.</p>
    );
  if (!hasRole)
    return (
      <p className="text-sm text-red-600">Acesso restrito a administradores.</p>
    );
  if (loading)
    return <p className="text-sm text-gray-500">Carregando usuário...</p>;
  if (!usuario)
    return <p className="text-sm text-red-600">Usuário não encontrado.</p>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Editar Usuário
      </h1>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}
      <form action={onSubmit} className="space-y-6">
        <div>
          <label
            htmlFor={nomeId}
            className="block text-sm font-medium text-gray-700"
          >
            Nome
          </label>
          <input
            id={nomeId}
            name="nome"
            defaultValue={usuario.nome}
            required
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label
            htmlFor={emailId}
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            defaultValue={usuario.email}
            required
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label
            htmlFor={cpfId}
            className="block text-sm font-medium text-gray-700"
          >
            CPF
          </label>
          <input
            id={cpfId}
            name="cpf"
            inputMode="numeric"
            pattern="[0-9]{11}"
            defaultValue={usuario.cpf}
            required
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            11 dígitos (apenas números)
          </p>
        </div>
        <div>
          <label
            htmlFor={tipoId}
            className="block text-sm font-medium text-gray-700"
          >
            Tipo
          </label>
          <select
            id={tipoId}
            name="tipo"
            defaultValue={usuario.tipo}
            required
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
          >
            {tiposValidos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
