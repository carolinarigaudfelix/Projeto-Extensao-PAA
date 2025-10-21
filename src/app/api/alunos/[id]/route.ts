import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import type { TokenPayload } from '@/types/auth';

async function ensureAuthorizedForAlunos(req: Request) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return { ok: false, code: 401, message: 'Não autorizado' };
  const allowed = ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'PEDAGOGO'];
  if (!allowed.includes(token.tipo as string))
    return { ok: false, code: 403, message: 'Acesso negado' };
  return { ok: true, token };
}

export async function GET(req: Request) {
  try {
    const auth = await ensureAuthorizedForAlunos(req);
    if (!auth.ok)
      return NextResponse.json(
        { message: auth.message },
        { status: auth.code },
      );

    const url = new URL(req.url);
    const parts = url.pathname.split('/').filter(Boolean);
    const id = parts[parts.length - 1];
    const estudante = await prisma.estudante.findUnique({
      where: { id },
      include: {
        avaliacoes: {
          where: { isActive: true },
          orderBy: { data: 'desc' },
          include: {
            avaliador: { select: { nome: true, cargo: true } },
          },
        },
      },
    });

    if (!estudante)
      return NextResponse.json(
        { message: 'Estudante não encontrado.' },
        { status: 404 },
      );
    return NextResponse.json(estudante);
  } catch (error: unknown) {
    console.error('Erro ao buscar estudante:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar estudante.' },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await ensureAuthorizedForAlunos(req);
    if (!auth.ok)
      return NextResponse.json(
        { message: auth.message },
        { status: auth.code },
      );

    const url = new URL(req.url);
    const parts = url.pathname.split('/').filter(Boolean);
    const id = parts[parts.length - 1];
    const dadosAtualizacao = await req.json();

    delete dadosAtualizacao.id;
    delete dadosAtualizacao.criado;
    delete dadosAtualizacao.criadoPor;

    const payload = auth.token as unknown as TokenPayload;
    const estudanteAtualizado = await prisma.estudante.update({
      where: { id },
      data: {
        ...dadosAtualizacao,
        atualizadoPor: payload.id,
      },
    });

    return NextResponse.json(estudanteAtualizado);
  } catch (error: unknown) {
    console.error('Erro ao atualizar estudante:', error);
    const err = error as { code?: string } | undefined;
    if (err?.code === 'P2025')
      return NextResponse.json(
        { message: 'Estudante não encontrado.' },
        { status: 404 },
      );
    return NextResponse.json(
      {
        message: 'Erro ao atualizar estudante.',
        error: String(error),
      },
      { status: 400 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await ensureAuthorizedForAlunos(req);
    if (!auth.ok)
      return NextResponse.json(
        { message: auth.message },
        { status: auth.code },
      );

    const url = new URL(req.url);
    const parts = url.pathname.split('/').filter(Boolean);
    const id = parts[parts.length - 1];

    const payload = auth.token as unknown as TokenPayload;
    const estudanteDesativado = await prisma.estudante.update({
      where: { id },
      data: { isActive: false, atualizadoPor: payload.id },
    });

    return NextResponse.json({
      message: 'Estudante desativado com sucesso.',
      estudante: estudanteDesativado,
    });
  } catch (error: unknown) {
    console.error('Erro ao desativar estudante:', error);
    const err = error as { code?: string } | undefined;
    if (err?.code === 'P2025')
      return NextResponse.json(
        { message: 'Estudante não encontrado.' },
        { status: 404 },
      );
    return NextResponse.json(
      {
        message: 'Erro ao desativar estudante.',
        error: String(error),
      },
      { status: 500 },
    );
  }
}
