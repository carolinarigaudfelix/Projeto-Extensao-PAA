import { NextResponse } from 'next/server';
import type { JWT } from 'next-auth/jwt';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import { limparCPF, validarCPF } from '@/lib/validators';

function denied(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

async function adminGuard(req: Request) {
  const token = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as (JWT & { tipo?: string }) | null;
  if (!token) return denied(401, 'Não autorizado');
  if (token.tipo !== 'ADMIN') return denied(403, 'Somente ADMIN');
  return token;
}

export async function GET(req: Request) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  if (!id) return denied(400, 'ID inválido');
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        cpf: true,
        criado: true,
        atualizado: true,
        isActive: true,
      },
    });
    if (!usuario) return denied(404, 'Usuário não encontrado');
    return NextResponse.json(usuario);
  } catch {
    return denied(500, 'Erro interno');
  }
}

export async function PUT(req: Request) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  if (!id) return denied(400, 'ID inválido');
  try {
    const body = await req.json();
    const { nome, email, tipo, cpf } = body as Record<string, unknown>;
    if (nome && typeof nome !== 'string') return denied(400, 'Nome inválido');
    if (email && typeof email !== 'string')
      return denied(400, 'Email inválido');
    if (
      tipo &&
      !['ADMIN', 'COORDENADOR', 'PROFESSOR', 'PEDAGOGO'].includes(
        tipo as string,
      )
    )
      return denied(400, 'Tipo inválido');
    if (cpf) {
      if (typeof cpf !== 'string') return denied(400, 'CPF inválido');
      const cpfL = limparCPF(cpf);
      if (!validarCPF(cpfL)) return denied(400, 'CPF inválido');
    }

    const updateData: Record<string, unknown> = {};
    if (nome) updateData.nome = nome;
    if (email) updateData.email = email;
    if (tipo) updateData.tipo = tipo;
    if (cpf) updateData.cpf = limparCPF(cpf as string);

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        cpf: true,
        atualizado: true,
      },
    });
    return NextResponse.json(usuarioAtualizado);
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'P2025') return denied(404, 'Usuário não encontrado');
    if (e.code === 'P2002') return denied(409, 'Email ou CPF já cadastrado');
    return denied(500, 'Erro ao atualizar usuário');
  }
}

export async function DELETE(req: Request) {
  const guard = await adminGuard(req);
  if (guard instanceof NextResponse) return guard;
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  if (!id) return denied(400, 'ID inválido');
  try {
    // Garante que atualizadoPor sempre terá um valor válido
    let atualizadoPor = 'system';
    if (
      typeof guard === 'object' &&
      guard &&
      'id' in guard &&
      typeof guard.id === 'string'
    ) {
      atualizadoPor = guard.id;
    }
    const usuario = await prisma.usuario.update({
      where: { id },
      data: { isActive: false, atualizadoPor },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        isActive: true,
        atualizado: true,
      },
    });
    return NextResponse.json({
      message: 'Usuário desativado com sucesso',
      usuario,
    });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'P2025') return denied(404, 'Usuário não encontrado');
    return denied(500, 'Erro ao desativar usuário');
  }
}
