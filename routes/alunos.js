const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/*
 * Endpoint: POST /api/alunos
 * Função: Adicionar um novo estudante no banco de dados.
 */
router.post('/', async (req, res) => {
  const {
    nome,
    idade,
    matricula,
    email,
    telefone,
    yearSchooling,
    turma,
    curso,
    isSpecialNeeds,
    specialNeedsDetails
  } = req.body;

  try {
    // Pega o usuário que está criando o registro (assumindo que vem do middleware de autenticação)
    const usuarioCriador = req.user?.id || 'sistema';

    const novoEstudante = await prisma.estudante.create({
      data: {
        nome,
        idade,
        matricula,
        email,
        telefone,
        yearSchooling,
        turma,
        curso,
        isSpecialNeeds,
        specialNeedsDetails,
        // Campos de auditoria
        criadoPor: usuarioCriador,
        atualizadoPor: usuarioCriador
      },
    });

    res.status(201).json(novoEstudante);
  } catch (error) {
    console.error('Erro ao cadastrar estudante:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('matricula')) {
      return res.status(400).json({
        message: 'Já existe um estudante com esta matrícula.',
        error: 'MATRICULA_DUPLICADA'
      });
    }
    res.status(400).json({
      message: 'Erro ao cadastrar estudante.',
      error: error.message
    });
  }
});

/*
 * Endpoint: GET /api/alunos
 * Função: Listar todos os estudantes ativos.
 * Query params:
 * - includeInactive (boolean): se true, inclui estudantes inativos
 * - curso (string): filtra por curso
 * - turma (string): filtra por turma
 */
router.get('/', async (req, res) => {
  try {
    const { includeInactive, curso, turma } = req.query;

    // Monta o filtro baseado nos query params
    const where = {
      ...(includeInactive !== 'true' && { isActive: true }),
      ...(curso && { curso }),
      ...(turma && { turma })
    };

    const estudantes = await prisma.estudante.findMany({
      where,
      include: {
        // Inclui as últimas 5 avaliações de cada estudante
        avaliacoes: {
          where: { isActive: true },
          orderBy: { data: 'desc' },
          take: 5,
          include: {
            avaliador: {
              select: {
                nome: true,
                cargo: true
              }
            }
          }
        }
      },
      orderBy: { nome: 'asc' }
    });

    res.json(estudantes);
  } catch (error) {
    console.error('Erro ao buscar estudantes:', error);
    res.status(500).json({
      message: 'Erro ao buscar estudantes.',
      error: error.message
    });
  }
});

/*
 * Endpoint: GET /api/alunos/:id
 * Função: Buscar um estudante específico por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const estudante = await prisma.estudante.findUnique({
      where: { id },
      include: {
        avaliacoes: {
          where: { isActive: true },
          orderBy: { data: 'desc' },
          include: {
            avaliador: {
              select: {
                nome: true,
                cargo: true
              }
            }
          }
        }
      }
    });

    if (!estudante) {
      return res.status(404).json({ message: 'Estudante não encontrado.' });
    }

    res.json(estudante);
  } catch (error) {
    console.error('Erro ao buscar estudante:', error);
    res.status(500).json({
      message: 'Erro ao buscar estudante.',
      error: error.message
    });
  }
});

/*
 * Endpoint: PUT /api/alunos/:id
 * Função: Atualizar dados de um estudante
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = req.body;
    const usuarioAtualizador = req.user?.id || 'sistema';

    // Remove campos que não devem ser atualizados diretamente
    delete dadosAtualizacao.id;
    delete dadosAtualizacao.criado;
    delete dadosAtualizacao.criadoPor;

    const estudanteAtualizado = await prisma.estudante.update({
      where: { id },
      data: {
        ...dadosAtualizacao,
        atualizadoPor: usuarioAtualizador
      },
    });

    res.json(estudanteAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar estudante:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Estudante não encontrado.' });
    }
    res.status(400).json({
      message: 'Erro ao atualizar estudante.',
      error: error.message
    });
  }
});

/*
 * Endpoint: DELETE /api/alunos/:id
 * Função: Desativar um estudante (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioAtualizador = req.user?.id || 'sistema';

    const estudanteDesativado = await prisma.estudante.update({
      where: { id },
      data: {
        isActive: false,
        atualizadoPor: usuarioAtualizador
      },
    });

    res.json({
      message: 'Estudante desativado com sucesso.',
      estudante: estudanteDesativado
    });
  } catch (error) {
    console.error('Erro ao desativar estudante:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Estudante não encontrado.' });
    }
    res.status(500).json({
      message: 'Erro ao desativar estudante.',
      error: error.message
    });
  }
});

module.exports = router;