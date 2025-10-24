# Guia de Configuração - GitHub Actions

Este projeto utiliza GitHub Actions para CI/CD automático.

## 📋 Workflows Configurados

### 1. **CI (Integração Contínua)** - `ci.yml`
Executa em push/PR para `main` e `develop`:
- ✅ Lint com Biome
- ✅ Type checking com TypeScript
- ✅ Build do Next.js
- ✅ Validação do schema Prisma

### 2. **Deploy Production** - `deploy.yml`
Executa em push para `main`:
- 🚀 Deploy automático para Vercel (produção)
- 📝 Comentário com URL de deploy em PRs

### 3. **Preview Deploy** - `preview.yml`
Executa em PRs para `main` e `develop`:
- 👀 Build de preview
- 💬 Comentário automático em PRs

### 4. **Security Audit** - `security.yml`
Executa semanalmente (segundas-feiras 9h):
- 🔒 Auditoria de segurança npm
- 📦 Verificação de dependências desatualizadas

## 🔧 Configuração Necessária

### Secrets do GitHub (Settings > Secrets and variables > Actions)

#### Obrigatórios para todos os ambientes:
```bash
NEXTAUTH_SECRET=<seu-secret-gerado>
DATABASE_URL=<sua-connection-string-mongodb>
```

#### Para deploy Vercel (opcional):
```bash
VERCEL_TOKEN=<token-da-vercel>
VERCEL_ORG_ID=<id-da-organizacao>
VERCEL_PROJECT_ID=<id-do-projeto>
```

#### Para preview (opcional):
```bash
PREVIEW_NEXTAUTH_URL=<url-do-preview>
PREVIEW_DATABASE_URL=<database-de-teste>
```

### Como obter os secrets Vercel:

1. **VERCEL_TOKEN:**
   ```bash
   # Acesse: https://vercel.com/account/tokens
   # Crie um novo token com escopo de deploy
   ```

2. **VERCEL_ORG_ID e VERCEL_PROJECT_ID:**
   ```bash
   # Instale Vercel CLI
   npm i -g vercel

   # Faça login
   vercel login

   # No diretório do projeto
   vercel link

   # Os IDs estarão em .vercel/project.json
   cat .vercel/project.json
   ```

## 🛡️ Branch Protection (Recomendado)

Configure em: **Settings > Branches > Branch protection rules**

Para branch `main`:
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging:
  - `Lint & Type Check`
  - `Build Application`
  - `Validate Prisma Schema`
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings

Para branch `develop`:
- ✅ Require status checks to pass before merging

## 🚀 Workflow de Deploy Recomendado

```
feature-branch → develop (CI) → main (CI + Deploy Production)
       ↓
   Preview Deploy (PR)
```

### Processo:
1. Desenvolva em feature branch
2. Abra PR para `develop` → CI roda + Preview build
3. Merge em `develop` → CI roda
4. Abra PR de `develop` para `main` → CI + Preview
5. Merge em `main` → Deploy automático para produção

## 📝 Scripts package.json Necessários

Certifique-se que existem no `package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "biome check .",
    "test": "echo 'No tests configured' && exit 0"
  }
}
```

## 🔍 Monitoramento

Acesse os workflows em:
```
https://github.com/carolinarigaudfelix/Projeto-Extensao-PAA/actions
```

## 🐛 Troubleshooting

### Build falha com erro de Prisma:
- Verifique se `DATABASE_URL` está configurado nos secrets
- Confirme que `npx prisma generate` roda no workflow

### Deploy Vercel falha:
- Verifique se os 3 secrets Vercel estão corretos
- Confirme permissões do token Vercel

### Type check falha:
- Execute localmente: `npx tsc --noEmit`
- Corrija erros de TypeScript antes do push

### Lint falha:
- Execute localmente: `npm run lint`
- Use `npm run lint:fix` para correções automáticas (se configurado)

## 💡 Dicas

- Use `workflow_dispatch` para executar manualmente qualquer workflow
- Monitore logs em tempo real na aba Actions
- Configure notificações no GitHub para falhas de workflow
- Revise semanalmente o Security Audit

## 🔄 Atualizações Futuras

Considere adicionar:
- [ ] Testes unitários (Jest + Testing Library)
- [ ] Testes E2E (Playwright/Cypress)
- [ ] Análise de cobertura de código
- [ ] Deploy automático para staging
- [ ] Rollback automático em caso de falha
- [ ] Performance monitoring (Lighthouse CI)
