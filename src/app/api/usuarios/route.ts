import prisma from "@/lib/prisma";
import { limparCPF, validarCPF } from "@/lib/validators";
import { hash } from "bcrypt";
import type { JWT } from "next-auth/jwt";
import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type TokenLike = JWT & { tipo?: string };

// POST - Criar novo usuário
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é admin
    const userType = (token as TokenLike).tipo;
    if (userType !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem criar usuários" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const schema = z.object({
      nome: z.string().min(2, "Nome muito curto"),
      email: z.string().email("Email inválido"),
      senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
      tipo: z.enum(["ADMIN", "COORDENADOR", "PROFESSOR", "PEDAGOGO"]),
      cpf: z.string().min(11, "CPF incompleto"), // antes da sanitização
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          issues: parsed.error.issues.map((i) => ({
            path: i.path,
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { nome, email, senha, tipo, cpf } = parsed.data;
    const cpfL = limparCPF(cpf);
    if (!validarCPF(cpfL)) {
      return NextResponse.json(
        {
          error: "CPF inválido",
          issues: [{ path: ["cpf"], message: "CPF inválido" }],
        },
        { status: 400 }
      );
    }

    // Verificar se email/CPF já existem
    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        OR: [{ email }, { cpf: cpfL }],
      },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { error: "Email ou CPF já cadastrado", code: "USUARIO_DUPLICADO" },
        { status: 409 }
      );
    }

    // Criar hash da senha
    const senhaHash = await hash(senha, 10);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        tipo,
        cpf: cpfL,
        criadoPor: "sistema",
        atualizadoPor: "sistema",
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        cpf: true,
        criado: true,
      },
    });

    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// GET - Listar usuários
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticação
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é admin
    const userType = (token as TokenLike).tipo;
    if (userType !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem listar usuários" },
        { status: 403 }
      );
    }

    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        cpf: true,
        criado: true,
        atualizado: true,
      },
      orderBy: { criado: "desc" },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
