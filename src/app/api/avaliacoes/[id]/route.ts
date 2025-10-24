import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id },
      include: {
        estudante: {
          select: { id: true, nome: true, matricula: true, email: true },
        },
        avaliador: { select: { nome: true, cargo: true } },
      },
    });
    if (!avaliacao) {
      return NextResponse.json(
        { message: 'Avaliação não encontrada.' },
        { status: 404 },
      );
    }
    return NextResponse.json(avaliacao);
  } catch (e) {
    console.error('Erro ao buscar avaliação:', e);
    return NextResponse.json(
      { message: 'Erro ao buscar avaliação.' },
      { status: 500 },
    );
  }
}
