import prisma from '@/lib/prisma';
import { hash } from 'bcrypt';
import type { JWT } from 'next-auth/jwt';
import { getToken } from 'next-auth/jwt';
import { type NextRequest, NextResponse } from 'next/server';

type TokenLike = JWT & { tipo?: string };

// POST - Criar novo usuário
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    const userType = (token as TokenLike).tipo;
    if (userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem criar usuários' },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { nome, email, senha, tipo, cpf } = body;

    // Validações
    if (!nome) {
      return NextResponse.json(
        { error: 'Campo nome é obrigatório' },
        { status: 400 },
      );
    }
    if (!email)
      return NextResponse.json(
        { error: 'Campo email é obrigatório' },
        { status: 400 },
      );
    if (!senha)
      return NextResponse.json(
        { error: 'Campo senha é obrigatório' },
        { status: 400 },
      );
    if (!tipo)
      return NextResponse.json(
        { error: 'Campo tipo é obrigatório' },
        { status: 400 },
      );
    if (!cpf)
      return NextResponse.json(
        { error: 'Campo cpf é obrigatório' },
        { status: 400 },
      );
    if (senha.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 },
      );
    }
    const tiposValidos = ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'PEDAGOGO'];
    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo de usuário inválido' },
        { status: 400 },
      );
    }

    // Verificar se email já existe
    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        OR: [{ email }, { cpf }],
      },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 },
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
        cpf,
        criadoPor: 'sistema',
        atualizadoPor: 'sistema',
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
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

// GET - Listar usuários
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticação
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    const userType = (token as TokenLike).tipo;
    if (userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem listar usuários' },
        { status: 403 },
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
      orderBy: { criado: 'desc' },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}
