const express = require('express');
const router = express.Router(); // Usamos o "Router" do Express
const { PrismaClient } = require('@prisma/client'); // Importa o Prisma Client

// Instancia o Prisma Client (o objeto que tem acesso ao banco)
const prisma = new PrismaClient();

/*
 * Endpoint: POST /api/alunos
 * Função: Adicionar (criar) um novo aluno no banco de dados.
 */
router.post('/', async (req, res) => {
  // 'req.body' contém os dados enviados pelo frontend (seu index.js)
  const { nome, matricula, curso } = req.body;

  try {
    // Usa o Prisma Client para criar um novo aluno no banco
    const novoAluno = await prisma.aluno.create({
      data: {
        nome: nome,
        matricula: matricula,
        curso: curso,
      },
    });

    // Retorna o aluno que acabou de ser criado (com status 201 - "Criado")
    res.status(201).json(novoAluno);

  } catch (error) {
    // Se der erro (ex: matrícula duplicada por causa do @unique no schema)
    console.error(error);
    res.status(400).json({ message: 'Erro ao cadastrar aluno.', error: error.message });
  }
});

/*
 * Endpoint: GET /api/alunos
 * Função: Listar todos os alunos cadastrados.
 */
router.get('/', async (req, res) => {
  try {
    // Usa o Prisma Client para buscar todos os alunos
    const alunos = await prisma.aluno.findMany();
    res.json(alunos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar alunos.' });
  }
});

// Exporta as rotas para o server.js poder usá-las
module.exports = router;