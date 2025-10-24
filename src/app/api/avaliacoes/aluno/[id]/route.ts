import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // Busca as avaliações do aluno, mais recentes primeiro
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { estudanteId: id },
      orderBy: { data: 'desc' },
      include: {
        avaliador: { select: { nome: true, cargo: true } },
      },
    });
    return NextResponse.json(avaliacoes);
  } catch {
    return NextResponse.json(
      { message: 'Erro ao buscar avaliações do aluno.' },
      { status: 500 },
    );
  }
}
