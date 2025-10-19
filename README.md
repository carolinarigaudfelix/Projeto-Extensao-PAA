# Projeto de Extensão PAA

Sistema de gestão para o Programa de Apoio Acadêmico (PAA) da universidade.

## 🛠 Tecnologias

- **Next.js 15** - Framework Full-stack com App Router e API Routes
- **NextAuth.js** - Autenticação e gerenciamento de sessão
- **Prisma** - ORM moderno para MongoDB
- **TailwindCSS** - Framework CSS utilitário
- **TypeScript** - Linguagem com tipagem estática
- **MongoDB Atlas** - Banco de dados NoSQL na nuvem

## Estrutura do Projeto

```
src/
  ├── app/                    # Rotas e páginas Next.js
  │   ├── dashboard/         # Área administrativa
  │   │   ├── _components/   # Componentes do dashboard
  │   │   ├── alunos/       # Gestão de alunos
  │   │   └── avaliacoes/   # Sistema de avaliações
  │   └── api/              # Rotas da API
  ├── lib/                   # Utilitários e configurações
  │   ├── prisma.ts         # Cliente Prisma
  │   └── auth.ts           # Configuração de autenticação
  └── types/                # Definições de tipos TypeScript
```

## Funcionalidades

### Autenticação
- Login seguro via NextAuth.js
- Proteção de rotas
- Gerenciamento de sessão
- Múltiplos perfis (admin, professor, aluno)

### Dashboard
- Visão geral com estatísticas
- Navegação intuitiva
- Interface responsiva
- Sidebar com informações do usuário

### Gestão de Alunos
- Listagem de alunos
- Cadastro e edição
- Visualização de detalhes
- Filtros e busca

### Sistema de Avaliações
- Registro de avaliações
- Acompanhamento de desempenho
- Histórico de avaliações

## 📋 Instalação

### Pré-requisitos

Antes de começar, você precisa ter instalado:
* [Node.js](https://nodejs.org/pt-br/) (versão 18 ou superior)
* [npm](https://www.npmjs.com/) (normalmente vem com Node.js)
* Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### Configuração

1. Clone o repositório:
```bash
git clone https://github.com/carolinarigaudfelix/Projeto-Extensao-PAA.git
cd Projeto-Extensao-PAA
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Configure o banco de dados:
```bash
# Sincroniza o schema com o banco
npx prisma db push

# Gera o Prisma Client
npx prisma generate
```

5. Inicie o servidor Next.js:
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`
As rotas da API estarão disponíveis em `http://localhost:3000/api`

### Troubleshooting

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

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a versão de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npx prisma generate` - Gera o cliente Prisma
- `npx prisma db push` - Sincroniza o schema com o banco

## 📡 API Endpoints

### 🔒 Autenticação

A API utiliza autenticação via JWT (JSON Web Token). Para endpoints protegidos, inclua o token no header:

```
Authorization: Bearer <seu_token_jwt>
```

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

## Variáveis de Ambiente

```env
# Banco de dados
DATABASE_URL="mongodb+srv://SEU_USUARIO:SUA_SENHA@SEU_CLUSTER.xxxxx.mongodb.net/pedagogia_db?retryWrites=true&w=majority"

# NextAuth
NEXTAUTH_SECRET="sua-chave-secreta"
NEXTAUTH_URL="http://localhost:3000"
```

> ⚠️ **Importante**: Certifique-se de que `.env` está no `.gitignore` para não vazar credenciais!

## Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feature/nome-da-feature`
2. Faça commit das mudanças: `git commit -m 'feat: Adiciona nova funcionalidade'`
3. Envie para a branch: `git push origin feature/nome-da-feature`
4. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
