'use client';

import { useRoleGuard } from '@/lib/route-guard';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { z } from 'zod';

const schema = z.object({
  nome: z.string().min(2),
  idade: z.coerce.number().int().min(1),
  matricula: z.string().min(3),
  email: z.string().email().optional().or(z.literal('')),
  telefone: z.string().optional().or(z.literal('')),
  yearSchooling: z.coerce.number().int().min(1),
  turma: z.string().optional().or(z.literal('')),
  curso: z.string().optional().or(z.literal('')),
  isSpecialNeeds: z.boolean().default(false),
  specialNeedsDetails: z.string().optional().or(z.literal('')),
});

export default function NovoAlunoPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const nomeId = useId();
  const idadeId = useId();
  const matriculaId = useId();
  const emailId = useId();
  const telefoneId = useId();
  const yearSchoolingId = useId();
  const turmaId = useId();
  const cursoId = useId();
  const isSpecialNeedsId = useId();
  const specialNeedsDetailsId = useId();
  const { isLoading, isAuthenticated, hasRole } = useRoleGuard([
    'ADMIN',
    'COORDENADOR',
    'PROFESSOR',
    'PEDAGOGO',
  ]);

  async function onSubmit(formData: FormData) {
    setError('');
    setLoading(true);
    try {
      const raw = Object.fromEntries(formData.entries());
      const parsed = schema.safeParse({
        ...raw,
        isSpecialNeeds: raw.isSpecialNeeds === 'on',
      });
      if (!parsed.success) {
        setError('Dados inválidos');
        return;
      }
      const res = await fetch('/api/alunos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.message || 'Falha ao criar aluno');
        return;
      }
      router.push('/dashboard/alunos');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) return <p className="text-sm text-gray-500">Carregando...</p>;
  if (!isAuthenticated)
    return (
      <p className="text-sm text-red-600">Você precisa estar autenticado.</p>
    );
  if (!hasRole) return <p className="text-sm text-red-600">Acesso restrito.</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Novo Aluno</h1>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}
      <form action={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              required
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor={idadeId}
              className="block text-sm font-medium text-gray-700"
            >
              Idade
            </label>
            <input
              id={idadeId}
              name="idade"
              type="number"
              required
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor={matriculaId}
              className="block text-sm font-medium text-gray-700"
            >
              Matrícula
            </label>
            <input
              id={matriculaId}
              name="matricula"
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
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor={telefoneId}
              className="block text-sm font-medium text-gray-700"
            >
              Telefone
            </label>
            <input
              id={telefoneId}
              name="telefone"
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor={yearSchoolingId}
              className="block text-sm font-medium text-gray-700"
            >
              Ano Escolar
            </label>
            <input
              id={yearSchoolingId}
              name="yearSchooling"
              type="number"
              required
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor={turmaId}
              className="block text-sm font-medium text-gray-700"
            >
              Turma
            </label>
            <input
              id={turmaId}
              name="turma"
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor={cursoId}
              className="block text-sm font-medium text-gray-700"
            >
              Curso
            </label>
            <input
              id={cursoId}
              name="curso"
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-gray-700">
            Necessidades especiais
          </legend>
          <div className="flex items-center gap-2">
            <input
              id={isSpecialNeedsId}
              name="isSpecialNeeds"
              type="checkbox"
              className="rounded border-gray-300"
            />
            <label htmlFor={isSpecialNeedsId} className="text-sm text-gray-700">
              Possui necessidades especiais
            </label>
          </div>
          <div>
            <label
              htmlFor={specialNeedsDetailsId}
              className="block text-sm font-medium text-gray-700"
            >
              Detalhes
            </label>
            <textarea
              id={specialNeedsDetailsId}
              name="specialNeedsDetails"
              rows={3}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </fieldset>
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
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
