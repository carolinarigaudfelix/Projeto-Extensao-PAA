// Importações principais
const express = require('express');
const cors = require('cors');

// 1. Importar as rotas que vamos criar
const rotasAlunos = require('./routes/alunos');

// Inicializar o Express
const app = express();
const PORT = process.env.PORT || 5000; // O servidor vai rodar na porta 5000

// Middlewares (Configurações)
app.use(cors()); // Permite que o frontend (em outra URL) acesse a API
app.use(express.json()); // Permite que o Express entenda requisições com corpo JSON

// 2. Definir a rota principal da API
// "Qualquer requisição que começar com /api/alunos, mande para o arquivo 'rotasAlunos'"
app.use('/api/alunos', rotasAlunos);

// Rota de teste
app.get('/', (req, res) => {
  res.send('API do Projeto de Pedagogia rodando!');
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});