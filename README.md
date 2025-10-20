# Projeto de Extensão PAA

Sistema de gestão para o Programa de Apoio Acadêmico (PAA) da UERJ.

## 🛠 Tecnologias

- **Next.js 15** - Framework Full-stack com App Router e API Routes
- **NextAuth.js** - Autenticação e gerenciamento de sessão
- **Prisma** - ORM moderno para MongoDB
- **Material-UI (MUI)** - Biblioteca de componentes React
- **TypeScript** - Linguagem com tipagem estática
- **MongoDB Atlas** - Banco de dados NoSQL na nuvem
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas e dados
- **Zustand** - Gerenciamento de estado
- **Biome** - Linter e formatador de código
- **bcrypt** - Hash de senhas

## Estrutura do Projeto

```
src/
  ├── app/                    # Rotas e páginas Next.js
  │   ├── dashboard/         # Área administrativa
  │   │   └── _components/   # Componentes do dashboard
  │   ├── auth/             # Autenticação
  │   │   └── login/        # Página de login
  │   └── api/              # Rotas da API
  │       ├── alunos/       # Endpoints de alunos
  │       ├── usuarios/     # Endpoints de usuários (CRUD básico)
  │       └── auth/         # Endpoints de autenticação
  ├── lib/                   # Utilitários e configurações
  │   ├── prisma.ts         # Cliente Prisma
  │   └── route-guard.ts    # Proteção de rotas
  └── types/                # Definições de tipos TypeScript
      ├── auth.ts           # Tipos de autenticação
      └── next-auth.d.ts    # Extensões NextAuth
```

## Funcionalidades

### Autenticação
- Login seguro via NextAuth.js
- Proteção de rotas
- Gerenciamento de sessão
- Múltiplos perfis (Admin, Coordenador, Professor, Pedagogo)

### Dashboard
- Visão geral com estatísticas
- Navegação intuitiva
- Interface responsiva
- Sidebar com informações do usuário
 - Páginas de CRUD: `Alunos` (listagem + criação) e `Usuários` (admin only)

### Gestão de Estudantes
- Listagem de estudantes
- Cadastro e edição
- Visualização de detalhes
- Suporte a necessidades especiais
- Filtros e busca
 - Formulário de criação em `/dashboard/alunos/novo`

### Sistema de Avaliações
- Registro de avaliações
- Acompanhamento de desempenho
- Histórico de avaliações

### Gestão de Usuários (ADMIN)
- Listagem de usuários em `/dashboard/usuarios`
- Criação de novos usuários em `/dashboard/usuarios/novo`
- Campos obrigatórios: nome, email, senha (mín. 6), tipo (perfil), CPF único

## 🎲 Modelos do Banco de Dados

### Estudante
- Informações pessoais (nome, idade, matrícula, email, telefone)
- Informações acadêmicas (ano escolar, turma, curso)
- Suporte a necessidades especiais
- Campos de auditoria (criado, atualizado, ativo)

### MembroPedagogico
- Informações pessoais e profissionais
- Vinculação com usuário do sistema
- Responsável por avaliações

### Usuario
- Credenciais de acesso (email, CPF, senha)
- Tipos: ADMIN, COORDENADOR, PROFESSOR, PEDAGOGO
- Campos de auditoria

### Avaliacao
- Descrição e data da avaliação
- Relacionamento com estudante e avaliador
- Histórico completo de acompanhamento

## �📋 Instalação

### Pré-requisitos

Antes de começar, você precisa ter instalado:
* [Node.js](https://nodejs.org/pt-br/) (versão 18 ou superior)
* [npm](https://www.npmjs.com/) (normalmente vem com Node.js)
* Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### Configuração

1. Instale as dependências:
```bash
make setup
```

2. Configure as variáveis de ambiente:

Crie um arquivo `.env` ou `.env.local` na raiz do projeto:

```env
# Banco de dados
DATABASE_URL="mongodb+srv://SEU_USUARIO:SUA_SENHA@SEU_CLUSTER.xxxxx.mongodb.net/pedagogia_db?retryWrites=true&w=majority"

# NextAuth
NEXTAUTH_SECRET="sua-chave-secreta"
NEXTAUTH_URL="http://localhost:3000"
```

3. Configure o banco de dados:
```bash
# Sincroniza o schema com o banco
make db-push

# Gera o Prisma Client
make db-gen
```

4. Inicie o servidor Next.js:
```bash
make dev
```

O aplicativo estará disponível em `http://localhost:3000`
As rotas da API estarão disponíveis em `http://localhost:3000/api`

### Criando o Primeiro Usuário

Para acessar o sistema, você precisa criar um usuário administrador:

**Opção 1: Usando Prisma Studio (Recomendado)**
```bash
make prisma-studio
```
1. Acesse `http://localhost:5555`
2. Clique em "Usuario"
3. Clique em "Add record"
4. Preencha os campos (mínimo obrigatório):
   - `nome`: Seu nome completo
   - `cpf`: CPF único (ex: 12345678900)
   - `email`: Seu email
   - `senhaHash`: Use um hash bcrypt (veja abaixo como gerar)
   - `tipo`: ADMIN
   - `criadoPor`: sistema
   - `atualizadoPor`: sistema
   - `isActive`: true

**Para gerar o hash da senha**, execute no terminal Node.js:
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('sua-senha-aqui', 10).then(hash => console.log(hash));"
```

**Opção 2: Via Script**

Crie um arquivo `scripts/create-user.ts`:
```typescript
import { hash } from 'bcrypt';
import prisma from '../src/lib/prisma';

async function main() {
  const senhaHash = await hash('admin123', 10);

  const user = await prisma.usuario.create({
    data: {
      nome: "Administrador",
      cpf: "12345678900",
      email: "admin@example.com",
      senhaHash,
      tipo: "ADMIN",
      criadoPor: "sistema",
      atualizadoPor: "sistema"
    }
  });

  console.log('✅ Usuário criado:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Execute:
```bash
npx tsx scripts/create-user.ts
```

Depois acesse `/login` com as credenciais criadas!

### Troubleshooting

1. **Erro de conexão com MongoDB:**
   - Verifique se a string de conexão está correta no `.env`
   - Confirme se seu IP está liberado no MongoDB Atlas
   - Teste a conexão usando MongoDB Compass

2. **Prisma Client não encontrado:**
   ```bash
   make db-gen
   ```

3. **Porta já em uso:**
   - Mude a porta no `.env` ou termine o processo usando a porta atual

## 📦 Scripts Disponíveis

- `make dev` - Inicia o servidor de desenvolvimento
- `make build` - Cria a versão de produção
- `make start` - Inicia o servidor de produção
- `make lint` - Executa o linter
- `make format` - Formata o código usando Biome
- `make db-gen` - Gera o cliente Prisma
- `make db-push` - Sincroniza o schema com o banco
- `make prisma-studio` - Abre o Prisma Studio (interface visual do banco)
- `make clean` - Remove arquivos de build e dependências

## 📡 API Endpoints

### 🔒 Autenticação

A API utiliza **NextAuth.js** com autenticação baseada em sessão e cookies HTTP-only.

#### Como acessar o sistema:

1. **Crie um usuário no banco de dados** (via Prisma Studio ou script):
```javascript
// Exemplo usando Prisma Client
import { hash } from 'bcrypt';
import prisma from './lib/prisma';

const senhaHash = await hash('sua-senha', 10);
await prisma.usuario.create({
  data: {
    nome: "Admin User",
    cpf: "12345678900",
    email: "admin@example.com",
    senhaHash: senhaHash,
    tipo: "ADMIN",
    criadoPor: "sistema",
    atualizadoPor: "sistema"
  }
});
```

2. **Faça login na aplicação**:
   - Acesse `http://localhost:3000/login`
   - Digite seu email e senha
   - O NextAuth criará automaticamente uma sessão JWT
   - O token fica armazenado em cookies seguros

3. **Rotas protegidas**:
   - `/dashboard/*` - Requer autenticação
   - `/api/alunos/*` - Requer autenticação + perfil adequado (ADMIN, COORDENADOR, PROFESSOR ou PEDAGOGO)
    - `/api/usuarios/*` - Requer autenticação + perfil ADMIN

**Nota**: Você **não precisa** incluir manualmente tokens Bearer. O NextAuth gerencia a autenticação automaticamente via cookies.

### Estudantes

#### Criar novo estudante
`POST /api/alunos`

**Request:**
```json
{
  "nome": "João Silva",
  "idade": 18,
  "matricula": "12345678",
  "email": "joao.silva@example.com",
  "telefone": "21999999999",
  "yearSchooling": 12,
  "turma": "3A",
  "curso": "Ensino Médio",
  "isSpecialNeeds": false,
  "specialNeedsDetails": null
}
```

**Resposta (201):**
```json
{
  "id": "653068f0f0322312b918342a",
  "nome": "João Silva",
  "idade": 18,
  "matricula": "12345678",
  "email": "joao.silva@example.com",
  "telefone": "21999999999",
  "yearSchooling": 12,
  "turma": "3A",
  "curso": "Ensino Médio",
  "isSpecialNeeds": false,
  "specialNeedsDetails": null,
  "criado": "2025-10-20T15:30:10.000Z",
  "atualizado": "2025-10-20T15:30:10.000Z",
  "isActive": true
}
```

#### Listar todos os estudantes
`GET /api/alunos`

**Resposta (200):**
```json
[
  {
    "id": "653068f0f0322312b918342a",
    "nome": "João Silva",
    "idade": 18,
    "matricula": "12345678",
    "email": "joao.silva@example.com",
    "telefone": "21999999999",
    "yearSchooling": 12,
    "turma": "3A",
    "curso": "Ensino Médio",
    "isSpecialNeeds": false,
    "specialNeedsDetails": null,
    "criado": "2025-10-20T15:30:10.000Z",
    "atualizado": "2025-10-20T15:30:10.000Z",
    "isActive": true
  }
]
```

#### Buscar estudante por ID
`GET /api/alunos/{id}`

**Resposta (200):**
```json
{
  "id": "653068f0f0322312b918342a",
  "nome": "João Silva",
  "idade": 18,
  "matricula": "12345678",
  "email": "joao.silva@example.com",
  "telefone": "21999999999",
  "yearSchooling": 12,
  "turma": "3A",
  "curso": "Ensino Médio",
  "isSpecialNeeds": false,
  "specialNeedsDetails": null,
  "criado": "2025-10-20T15:30:10.000Z",
  "atualizado": "2025-10-20T15:30:10.000Z",
  "isActive": true
}
```

#### Atualizar estudante
`PUT /api/alunos/{id}`

**Request:**
```json
{
  "nome": "João Silva Santos",
  "telefone": "21988888888",
  "turma": "3B"
}
```

**Resposta (200):**
```json
{
  "id": "653068f0f0322312b918342a",
  "nome": "João Silva Santos",
  "idade": 18,
  "matricula": "12345678",
  "email": "joao.silva@example.com",
  "telefone": "21988888888",
  "yearSchooling": 12,
  "turma": "3B",
  "curso": "Ensino Médio",
  "isSpecialNeeds": false,
  "specialNeedsDetails": null,
  "criado": "2025-10-20T15:30:10.000Z",
  "atualizado": "2025-10-20T16:45:20.000Z",
  "isActive": true
}
```

#### Deletar estudante (soft delete)
`DELETE /api/alunos/{id}`

**Resposta (200):**
```json
{
  "message": "Estudante desativado com sucesso"
}
```

### Usuários (ADMIN)

#### Criar novo usuário
`POST /api/usuarios`

Campos obrigatórios (JSON body):
```json
{
  "nome": "Novo Usuário",
  "email": "novo.usuario@example.com",
  "senha": "senhaSegura123",
  "tipo": "PROFESSOR",
  "cpf": "98765432100"
}
```
Retorno (201):
```json
{
  "id": "653068f0f0322312b9189999",
  "nome": "Novo Usuário",
  "email": "novo.usuario@example.com",
  "tipo": "PROFESSOR",
  "cpf": "98765432100",
  "criado": "2025-10-20T17:20:00.000Z"
}
```

#### Listar usuários
`GET /api/usuarios`
Retorna lista com: id, nome, email, tipo, cpf, criado, atualizado.

#### Regras
- Apenas `ADMIN` pode acessar `/dashboard/usuarios` e a rota `/api/usuarios`.
- Senha mínima de 6 caracteres; armazenada como hash (bcrypt) em `senhaHash`.

### Fluxo de Login e Navegação
1. Acesso inicial redireciona para `/login`.
2. Após autenticação com credenciais válidas, usuário é enviado para `/dashboard`.
3. A navegação lateral só mostra itens compatíveis com o papel (`tipo`).
4. Formulários de criação validam entrada e exibem mensagens claras de erro.

## Variáveis de Ambiente

Crie um arquivo `.env` ou `.env.local` na raiz do projeto:

```env
# Banco de dados MongoDB
DATABASE_URL="mongodb+srv://SEU_USUARIO:SUA_SENHA@SEU_CLUSTER.xxxxx.mongodb.net/pedagogia_db?retryWrites=true&w=majority"

# NextAuth.js
NEXTAUTH_SECRET="sua-chave-secreta-aleatoria-muito-segura"
NEXTAUTH_URL="http://localhost:3000"
```

> ⚠️ **Importante**:
> - Certifique-se de que `.env` e `.env.local` estão no `.gitignore` para não vazar credenciais!
> - Gere uma chave secreta forte para `NEXTAUTH_SECRET`
> - Configure seu IP no whitelist do MongoDB Atlas

## Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feature/nome-da-feature`
2. Faça commit das mudanças: `git commit -m 'feat: Adiciona nova funcionalidade'`
3. Envie para a branch: `git push origin feature/nome-da-feature`
4. Abra um Pull Request

## 📜 Changelog / Alterações Recentes

Esta seção consolida as principais modificações aplicadas recentemente ao projeto (originadas de `ALTERACOES.md`).

### 1. Fluxo de Autenticação
- Página inicial (`/`) agora redireciona para `/login` (fluxo explícito de entrada)
- Middleware protege rotas do dashboard exigindo sessão válida
- Melhor tratamento de primeiro acesso (instruções para criação do primeiro ADMIN)

### 2. Tela de Login
- UI limpa e profissional
- Mensagens de erro com melhor feedback
- Card explicativo sobre criação de usuário inicial (ADMIN)
- Labels e acessibilidade aprimoradas

### 3. Gestão de Usuários (ADMIN)
- Listagem em `/dashboard/usuarios` mostrando nome, email, tipo, CPF
- Indicação do usuário logado ("Você")
- Criação via `/dashboard/usuarios/novo` com validações (senha ≥ 6, email único, CPF único, tipo válido)
- Edição via `/dashboard/usuarios/[id]/editar` (atualização seletiva de campos)

### 4. API de Usuários
- `GET /api/usuarios` (ADMIN) lista usuários
- `POST /api/usuarios` (ADMIN) cria usuários com hash bcrypt
- `GET /api/usuarios/[id]` obtém dados por ID
- `PUT /api/usuarios/[id]` atualiza dados (tratamento de erros Prisma p/ duplicidade / não encontrado)

### 5. Header
- Avatar dinâmico com inicial ou fallback "?"
- Menu dropdown com nome, email e logout

### 6. Sidebar
- Itens filtrados por role
- Link "Usuários" visível apenas para ADMIN

### 7. Controle de Acesso Consolidado
```
/dashboard/*            → Requer autenticação
/dashboard/usuarios/*   → Requer role ADMIN
/api/usuarios/*         → Requer role ADMIN
/api/alunos/*           → Requer roles: ADMIN | COORDENADOR | PROFESSOR | PEDAGOGO
```

### 8. UX / Acessibilidade
- Tratamento para usuário sem nome
- Feedback visual de carregamento/erros
- Estrutura responsiva
- Labels e textos auxiliares para screen readers

### 9. Segurança
- Senhas com hash bcrypt
- Segredo NextAuth exigido em produção (fallback gerado em dev para evitar crash)
- Middleware valida sessão antes de liberar dashboard/APIs sensíveis

### 10. Próximos Passos Sugeridos
- Paginação em listagens (usuários, alunos)
- Soft delete / desativação formal de usuários
- Testes automatizados (unitários e integração)
- Route Groups para separar área pública futura (`(public)` vs `(admin)`)
- Logs estruturados e auditoria mais completa (quem atualizou, IP, etc.)

### Status
Projeto organizado e operacional com fluxo de autenticação e gestão inicial de usuários e alunos.
