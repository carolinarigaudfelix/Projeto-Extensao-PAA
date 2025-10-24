export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      estudanteId,
      avaliadorId,
      data,
      descricao,
      evolucao,
      dificuldades,
      periodoReavaliacao,
    } = body;

    if (!(estudanteId && avaliadorId && data && descricao)) {
      return NextResponse.json(
        { message: 'Campos obrigatórios faltando.' },
        { status: 400 },
      );
    }

    const avaliacao = await prisma.avaliacao.create({
      data: {
        estudanteId,
        avaliadorId,
        data: new Date(data),
        descricao,
        evolucao: evolucao || null,
        dificuldades: dificuldades || null,
        periodoReavaliacao: periodoReavaliacao
          ? Number(periodoReavaliacao)
          : null,
        criado: new Date(),
        criadoPor: 'sistema',
        atualizadoPor: 'sistema',
      },
    });
    return NextResponse.json(avaliacao, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { message: 'Erro ao criar avaliação.' },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Busca as avaliações mais recentes de todos os alunos, incluindo evolução, dificuldades, recorrência e dados do estudante
    const avaliacoes = await prisma.avaliacao.findMany({
      orderBy: { data: 'desc' },
      take: 50,
      include: {
        avaliador: {
          select: { nome: true, cargo: true },
        },
        estudante: {
          select: { id: true, nome: true, matricula: true },
        },
      },
    });
    return NextResponse.json(avaliacoes);
  } catch {
    return NextResponse.json(
      { message: 'Erro ao buscar avaliações.' },
      { status: 500 },
    );
  }
}
