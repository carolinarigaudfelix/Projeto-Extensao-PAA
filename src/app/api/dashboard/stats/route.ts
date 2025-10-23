import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

// GET - Buscar estatísticas do dashboard
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticação
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar estatísticas em paralelo
    const [
      totalAlunos,
      alunosAtivos,
      totalUsuarios,
      usuariosPorTipo,
      alunosComNecessidadesEspeciais,
      alunosRecentesCount,
    ] = await Promise.all([
      // Total de alunos
      prisma.estudante.count(),

      // Alunos ativos
      prisma.estudante.count({
        where: { isActive: true },
      }),

      // Total de usuários
      prisma.usuario.count(),

      // Usuários por tipo
      prisma.usuario.groupBy({
        by: ["tipo"],
        _count: true,
        where: { isActive: true },
      }),

      // Alunos com necessidades especiais
      prisma.estudante.count({
        where: {
          isActive: true,
          isSpecialNeeds: true,
        },
      }),

      // Alunos cadastrados nos últimos 30 dias
      prisma.estudante.count({
        where: {
          criado: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Formatar dados de usuários por tipo
    const usuariosPorTipoFormatado = usuariosPorTipo.reduce((acc, item) => {
      acc[item.tipo] = item._count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      alunos: {
        total: totalAlunos,
        ativos: alunosAtivos,
        comNecessidadesEspeciais: alunosComNecessidadesEspeciais,
        cadastradosRecentemente: alunosRecentesCount,
      },
      usuarios: {
        total: totalUsuarios,
        porTipo: usuariosPorTipoFormatado,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    );
  }
}
