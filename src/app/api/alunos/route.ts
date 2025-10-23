import prisma from "@/lib/prisma";
import type { TokenPayload } from "@/types/auth";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { z } from "zod";

const ALLOWED_ROLES = ["ADMIN", "COORDENADOR", "PROFESSOR", "PEDAGOGO"];

export async function GET(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token)
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    if (!ALLOWED_ROLES.includes(token.tipo as string))
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });

    const url = new URL(req.url);
    const includeInactive = url.searchParams.get("includeInactive");
    const curso = url.searchParams.get("curso");
    const turma = url.searchParams.get("turma");

    const where = {
      ...(includeInactive !== "true" && { isActive: true }),
      ...(curso && { curso }),
      ...(turma && { turma }),
    };

    const estudantes = await prisma.estudante.findMany({
      where,
      include: {
        avaliacoes: {
          where: { isActive: true },
          orderBy: { data: "desc" },
          take: 5,
          include: {
            avaliador: {
              select: { nome: true, cargo: true },
            },
          },
        },
      },
      orderBy: { nome: "asc" },
    });

    return NextResponse.json(estudantes);
  } catch (error) {
    console.error("Erro ao buscar estudantes:", error);
    return NextResponse.json(
      { message: "Erro ao buscar estudantes." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token)
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    if (!ALLOWED_ROLES.includes(token.tipo as string))
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });

    const body = await req.json();

    // Validação estendida com campos do wizard (opcionais)
    const schema = z.object({
      nome: z.string().min(2),
      idade: z.number().int().min(1),
      matricula: z.string().min(3),
      email: z.string().email().optional().or(z.literal("")),
      telefone: z.string().optional().or(z.literal("")),
      yearSchooling: z.number().int().min(1),
      turma: z.string().optional().or(z.literal("")),
      curso: z.string().optional().or(z.literal("")),
      isSpecialNeeds: z.boolean().default(false),
      specialNeedsDetails: z.string().optional().or(z.literal("")),
      apoioEducacional: z.array(z.string()).default([]),
      apoioOutros: z.string().optional().or(z.literal("")),
      equipePedagogica: z
        .array(
          z.object({
            id: z.string(),
            nome: z.string().optional().or(z.literal("")),
            funcao: z.string().optional().or(z.literal("")),
            contato: z.string().optional().or(z.literal("")),
          })
        )
        .optional()
        .default([]),
      objetivosAvaliacao: z.string().optional().or(z.literal("")),
      conhecimentoEstudante: z.string().optional().or(z.literal("")),
      conhecimentoMultiplasFormas: z.string().optional().or(z.literal("")),
      conhecimentoDescricao: z.string().optional().or(z.literal("")),
      planificacaoDescricao: z.string().optional().or(z.literal("")),
      intervencaoPreliminar: z.string().optional().or(z.literal("")),
      intervencaoCompreensiva: z.string().optional().or(z.literal("")),
      intervencaoTransicional: z.string().optional().or(z.literal("")),
      observacoes: z.string().optional().or(z.literal("")),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Dados inválidos.",
          issues: parsed.error.issues.map((i) => ({
            path: i.path,
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const payload = token as unknown as TokenPayload;
    const { apoioEducacional, equipePedagogica, ...rest } = parsed.data;

    const novoEstudante = await prisma.estudante.create({
      data: {
        ...rest,
        apoioEducacional: apoioEducacional ?? [],
        equipePedagogica: equipePedagogica?.length
          ? equipePedagogica
          : undefined,
        criadoPor: payload.id,
        atualizadoPor: payload.id,
      },
    });

    return NextResponse.json(novoEstudante, { status: 201 });
  } catch (error) {
    console.error("Erro ao cadastrar estudante:", error);
    const err = error as { code?: string; meta?: { target?: string[] } };

    if (err?.code === "P2002" && err?.meta?.target?.includes("matricula")) {
      return NextResponse.json(
        {
          message: "Já existe um estudante com esta matrícula.",
          error: "MATRICULA_DUPLICADA",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Erro ao cadastrar estudante." },
      { status: 400 }
    );
  }
}
