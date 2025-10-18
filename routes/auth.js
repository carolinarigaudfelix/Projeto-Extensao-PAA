const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

/**
 * POST /api/auth/login
 * Rota para autenticação de usuários
 */
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validação básica
    if (!(email && senha)) {
      return res.status(400).json({
        message: 'Email e senha são obrigatórios',
      });
    }

    // Busca o usuário pelo email
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        membroPedagogico: {
          select: {
            id: true,
            cargo: true,
          },
        },
      },
    });

    // Se não encontrou o usuário ou ele está inativo
    if (!(usuario?.isActive)) {
      return res.status(401).json({
        message: 'Credenciais inválidas',
      });
    }

    // Verifica a senha
    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      return res.status(401).json({
        message: 'Credenciais inválidas',
      });
    }

    // Gera o token JWT
    const token = jwt.sign(
      {
        userId: usuario.id,
        tipo: usuario.tipo,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
    );

    // Remove dados sensíveis antes de enviar
    const { senhaHash, ...usuarioSemSenha } = usuario;

    res.json({
      token,
      usuario: usuarioSemSenha,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      message: 'Erro ao realizar login',
    });
  }
});

/**
 * POST /api/auth/register
 * Rota para registro de novos usuários (apenas ADMIN pode criar)
 */
router.post('/register', async (req, res) => {
  try {
    const {
      nome,
      email,
      senha,
      cpf,
      telefone,
      tipo,
      cargo, // apenas se for membro pedagógico
    } = req.body;

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Criar o usuário em uma transação
    const resultado = await prisma.$transaction(async (tx) => {
      // Cria o usuário
      const novoUsuario = await tx.usuario.create({
        data: {
          nome,
          email,
          cpf,
          telefone,
          tipo,
          senhaHash,
          criadoPor: 'sistema', // ou req.user.id se estiver autenticado
          atualizadoPor: 'sistema',
        },
      });

      // Se for membro pedagógico, cria o registro correspondente
      if (tipo !== 'ADMIN' && cargo) {
        await tx.membroPedagogico.create({
          data: {
            nome,
            cargo,
            userId: novoUsuario.id,
            criadoPor: 'sistema',
            atualizadoPor: 'sistema',
          },
        });
      }

      return novoUsuario;
    });

    // Remove a senha antes de enviar
    const { senhaHash: _, ...usuarioSemSenha } = resultado;

    res.status(201).json(usuarioSemSenha);
  } catch (error) {
    console.error('Erro no registro:', error);
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('email')) {
        return res.status(400).json({
          message: 'Este email já está em uso',
        });
      }
      if (error.meta?.target?.includes('cpf')) {
        return res.status(400).json({
          message: 'Este CPF já está cadastrado',
        });
      }
    }
    res.status(500).json({
      message: 'Erro ao criar usuário',
    });
  }
});

module.exports = router;
