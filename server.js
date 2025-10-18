require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { authMiddleware, verificarPermissao } = require('./middleware/auth');
const { TipoUsuario } = require('@prisma/client');

// Inicializar o Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rota de teste/health check
app.get('/', (req, res) => {
  res.send('API do PAA rodando!');
});

// Rotas que não precisam de autenticação
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Middleware de autenticação para todas as outras rotas da API
app.use('/api', authMiddleware);

// Rotas protegidas
const rotasAlunos = require('./routes/alunos');
app.use(
  '/api/alunos',
  verificarPermissao([TipoUsuario.ADMIN, TipoUsuario.COORDENADOR, TipoUsuario.PROFESSOR, TipoUsuario.PEDAGOGO]),
  rotasAlunos
);

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});