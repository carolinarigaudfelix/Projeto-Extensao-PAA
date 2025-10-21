import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import type { TokenPayload } from '@/types/auth';

const ALLOWED_ROLES = ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'PEDAGOGO'];

export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token)
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    if (!ALLOWED_ROLES.includes(token.tipo as string))
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });

    const url = new URL(req.url);
    const includeInactive = url.searchParams.get('includeInactive');
    const curso = url.searchParams.get('curso');
    const turma = url.searchParams.get('turma');

    const where = {
      ...(includeInactive !== 'true' && { isActive: true }),
      ...(curso && { curso }),
      ...(turma && { turma }),
    };

    const estudantes = await prisma.estudante.findMany({
      where,
      include: {
        avaliacoes: {
          where: { isActive: true },
          orderBy: { data: 'desc' },
          take: 5,
          include: {
            avaliador: {
              select: { nome: true, cargo: true },
            },
          },
        },
      },
      orderBy: { nome: 'asc' },
    });

    return NextResponse.json(estudantes);
  } catch (error) {
    console.error('Erro ao buscar estudantes:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar estudantes.' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token)
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    if (!ALLOWED_ROLES.includes(token.tipo as string))
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });

    const body = await req.json();

    const payload = token as unknown as TokenPayload;
    const novoEstudante = await prisma.estudante.create({
      data: {
        ...body,
        criadoPor: payload.id,
        atualizadoPor: payload.id,
      },
    });

    return NextResponse.json(novoEstudante, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar estudante:', error);
    const err = error as { code?: string; meta?: { target?: string[] } };

    if (err?.code === 'P2002' && err?.meta?.target?.includes('matricula')) {
      return NextResponse.json(
        {
          message: 'Já existe um estudante com esta matrícula.',
          error: 'MATRICULA_DUPLICADA',
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: 'Erro ao cadastrar estudante.' },
      { status: 400 },
    );
  }
}
