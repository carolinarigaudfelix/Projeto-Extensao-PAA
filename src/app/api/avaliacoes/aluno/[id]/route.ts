import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Busca as avaliações do aluno, mais recentes primeiro
    const avaliacoes = await prisma.avaliacao.findMany({
      where: { estudanteId: params.id },
      orderBy: { data: "desc" },
      include: {
        avaliador: { select: { nome: true, cargo: true } },
      },
    });
    return NextResponse.json(avaliacoes);
  } catch {
    return NextResponse.json(
      { message: "Erro ao buscar avaliações do aluno." },
      { status: 500 }
    );
  }
}
