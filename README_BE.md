# Backend PAA 🎓

Backend para a aplicação de gerenciamento de estudantes necessitados suporte pedagógico especial. API REST construída com Node.js, Express e Prisma, usando MongoDB Atlas como banco de dados.

## 🛠 Tecnologias

* **Node.js:** (>= 18.x) - Ambiente de execução JavaScript
* **Express:** Framework web para Node.js
* **Prisma:** ORM moderno para MongoDB
* **MongoDB Atlas:** Banco de dados NoSQL na nuvem

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

* [Node.js](https://nodejs.org/pt-br/) (versão 18 ou superior)
* [npm](https://www.npmjs.com/) (normalmente vem com Node.js)
* Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 🚀 Instalação e Configuração

### 1. Instale as dependências
```bash
npm install
```

### 2. Configure as variáveis de ambiente

1. Copie o arquivo de exemplo para criar seu próprio arquivo de ambiente:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL="mongodb+srv://SEU_USUARIO:SUA_SENHA@SEU_CLUSTER.xxxxx.mongodb.net/pedagogia_db?retryWrites=true&w=majority"
PORT=5000
JWT_SECRET=sua_chave_secreta_aqui
```

> ⚠️ **Importante**: Certifique-se de que `.env` está no `.gitignore` para não vazar credenciais!

### 3. Configure o banco de dados

Execute os comandos do Prisma para sincronizar o schema e gerar o cliente:

```bash
# Sincroniza o schema com o banco
npx prisma db push

# Gera o Prisma Client
npx prisma generate
```

### 5. Inicie o servidor

Para desenvolvimento (com hot-reload):
```bash
npm run dev
```

Para produção:
```bash
npm start
```

O servidor iniciará na porta definida no `.env` (default: 5000).
Você verá a mensagem: `Servidor rodando na porta 5000`

-----

## 📡 Endpoints da API

### Alunos

#### Criar novo aluno
`POST /api/alunos`

**Request:**
```json
{
  "nome": "Nome do Aluno",
  "matricula": "12345678",
  "curso": "Nome do Curso"
}
```

**Resposta (201):**
```json
{
  "id": "653068f0f0322312b918342a",
  "nome": "Nome do Aluno",
  "matricula": "12345678",
  "curso": "Nome do Curso",
  "dataCadastro": "2025-10-18T20:30:10.000Z"
}
```

**Exemplo com curl:**
```bash
curl -X POST http://localhost:5000/api/alunos \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","matricula":"12345678","curso":"Pedagogia"}'
```

#### Listar todos os alunos
`GET /api/alunos`

**Resposta (200):**
```json
[
  {
    "id": "653068f0f0322312b918342a",
    "nome": "Nome do Aluno",
    "matricula": "12345678",
    "curso": "Nome do Curso",
    "dataCadastro": "2025-10-18T20:30:10.000Z"
  }
]
```

**Exemplo com curl:**
```bash
curl http://localhost:5000/api/alunos
```

## 🔒 Autenticação

A API utiliza autenticação via JWT (JSON Web Token). Para endpoints protegidos, inclua o token no header:

```
Authorization: Bearer <seu_token_jwt>
```

> Consulte a documentação completa para obter informações sobre como obter o token.

## ❗ Troubleshooting

### Problemas comuns:

1. **Erro de conexão com MongoDB:**
   - Verifique se a string de conexão está correta no `.env`
   - Confirme se seu IP está liberado no MongoDB Atlas
   - Teste a conexão usando MongoDB Compass

2. **Prisma Client não encontrado:**
   ```bash
   npx prisma generate
   ```

3. **Porta já em uso:**
   - Mude a porta no `.env` ou termine o processo usando a porta atual

4. **Erro de autenticação:**
   - Verifique se o token JWT está correto e não expirou
   - Confirme se está usando o formato correto no header

## 📦 Scripts disponíveis

No arquivo `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

## 🤝 Contribuindo

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📮 Contato

Carolina Rigaud Felix - [GitHub](https://github.com/carolinarigaudfelix)

<!-- end list -->

```