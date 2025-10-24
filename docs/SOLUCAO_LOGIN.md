# 🔐 Solução: Problema de Login (CredentialsSignin)

## Problema Identificado

O erro `CredentialsSignin` estava ocorrendo porque os usuários no banco de dados estavam com o campo `isActive = false` (inativos).

### Código de Verificação no Auth

No arquivo `src/app/auth/config.ts`, existe uma verificação que bloqueia login de usuários inativos:

```typescript
if (!usuario.isActive) {
  const error = new CredentialsSignin();
  error.code = 'Usuário inativo. Entre em contato com o administrador';
  throw error;
}
```

## Solução Aplicada

### 1. Scripts Criados

Foram criados dois scripts úteis para gerenciar usuários:

#### **`scripts/check-users.ts`** - Verificar usuários
```bash
npx tsx scripts/check-users.ts
```
Lista todos os usuários do banco com suas informações de status.

#### **`scripts/activate-users.ts`** - Ativar usuários
```bash
npx tsx scripts/activate-users.ts
```
Ativa todos os usuários inativos no banco de dados.

### 2. Melhorias no Código de Autenticação

- ✅ Mensagens de erro mais claras e específicas
- ✅ Tratamento adequado de erros no NextAuth v5
- ✅ Feedback melhorado na página de login

## Como Usar

### Se você está tendo problemas de login:

1. **Verifique se há usuários no banco:**
   ```bash
   npx tsx scripts/check-users.ts
   ```

2. **Se os usuários estiverem inativos, ative-os:**
   ```bash
   npx tsx scripts/activate-users.ts
   ```

3. **Tente fazer login novamente**

### Ao criar novos usuários:

Certifique-se de que o campo `isActive` está definido como `true`:

```typescript
await prisma.usuario.create({
  data: {
    nome: "Nome do Usuário",
    email: "usuario@example.com",
    cpf: "12345678900",
    tipo: "ADMIN",
    isActive: true, // ← IMPORTANTE!
    senhaHash: await hash("senha123", 10),
    criadoPor: "system",
    atualizadoPor: "system",
  }
});
```

## Possíveis Causas do Erro CredentialsSignin

1. ❌ **Usuário inativo** (`isActive = false`)
2. ❌ **Email não encontrado** no banco de dados
3. ❌ **Senha incorreta**
4. ❌ **Usuário sem senha configurada** (`senhaHash` vazio)
5. ❌ **Email ou senha não fornecidos** no formulário

## Comandos Úteis

```bash
# Verificar usuários
npx tsx scripts/check-users.ts

# Ativar usuários
npx tsx scripts/activate-users.ts

# Abrir Prisma Studio (interface visual)
make prisma-studio

# Ou diretamente
npx prisma studio
```

## Observações

- O campo `isActive` é usado para soft-delete de registros
- Usuários inativos não conseguem fazer login
- Para "deletar" um usuário, defina `isActive = false` ao invés de remover do banco
- Isso preserva o histórico e as relações no banco de dados
