# Configuração de Variáveis de Ambiente para CI/CD

## ⚙️ Variáveis Necessárias

### 1. GitHub Secrets (Repository Settings)

Acesse: `Settings > Secrets and variables > Actions > New repository secret`

#### Produção (obrigatório):
```bash
NEXTAUTH_SECRET=<gere-com-openssl-rand-base64-32>
NEXTAUTH_URL=https://seu-dominio-producao.vercel.app
DATABASE_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/producao
```

#### Vercel Deploy (opcional, se usar deploy automático):
```bash
VERCEL_TOKEN=<seu-token-vercel>
VERCEL_ORG_ID=<id-da-org>
VERCEL_PROJECT_ID=<id-do-projeto>
```

#### Preview/Staging (opcional):
```bash
PREVIEW_NEXTAUTH_URL=https://preview-seu-projeto.vercel.app
PREVIEW_DATABASE_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/preview
```

---

## 🔐 Como Gerar NEXTAUTH_SECRET

Execute no terminal:
```bash
openssl rand -base64 32
```

Ou use Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 📦 Como Obter Credenciais Vercel

### 1. VERCEL_TOKEN
```bash
# Acesse: https://vercel.com/account/tokens
# Clique em "Create Token"
# Nome: "GitHub Actions Deploy"
# Scope: Full Account
# Copie o token gerado
```

### 2. VERCEL_ORG_ID e VERCEL_PROJECT_ID
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

O arquivo `.vercel/project.json` terá:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

---

## 🗄️ MongoDB Atlas para CI/CD

### Banco de Produção:
1. Acesse MongoDB Atlas
2. Crie cluster de produção
3. Configure IP Whitelist: `0.0.0.0/0` (permite GitHub Actions)
4. Crie usuário com permissões de leitura/escrita
5. Copie connection string

### Banco de Preview/Test (opcional):
- Crie cluster separado ou database diferente
- Use para testes e previews de PR
- Menor custo que produção

**Connection String:**
```
mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

---

## ✅ Checklist de Configuração

- [ ] `NEXTAUTH_SECRET` configurado
- [ ] `NEXTAUTH_URL` configurado (produção)
- [ ] `DATABASE_URL` configurado (produção)
- [ ] `VERCEL_TOKEN` configurado (se usar deploy)
- [ ] `VERCEL_ORG_ID` configurado (se usar deploy)
- [ ] `VERCEL_PROJECT_ID` configurado (se usar deploy)
- [ ] MongoDB permite IPs do GitHub Actions
- [ ] Secrets validados localmente primeiro

---

## 🧪 Testar Localmente

Crie arquivo `.env.test`:
```bash
NEXTAUTH_SECRET=test-secret-min-32-chars-long-xxxxx
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=mongodb://localhost:27017/test
```

Execute:
```bash
# Carregar variáveis
export $(cat .env.test | xargs)

# Rodar build como CI faria
npm run ci
```

---

## 🚨 Segurança

**NUNCA:**
- ❌ Commite `.env` ou `.env.local`
- ❌ Exponha secrets em logs
- ❌ Use secrets de produção em preview

**SEMPRE:**
- ✅ Use secrets diferentes para cada ambiente
- ✅ Rotacione secrets periodicamente
- ✅ Revogue tokens não utilizados
- ✅ Monitore acessos no MongoDB Atlas

---

## 📝 Validação Final

Depois de configurar todos os secrets, teste o workflow:

1. Faça um commit simples em `develop`:
```bash
git checkout develop
git commit --allow-empty -m "test: CI workflow"
git push origin develop
```

2. Acesse: `Actions` tab no GitHub
3. Verifique se workflow `CI` passou em todos os jobs
4. Corrija erros se necessário

---

## 🔄 Ambientes Recomendados

| Ambiente    | Branch    | Database        | URL                |
| ----------- | --------- | --------------- | ------------------ |
| Development | feature/* | Local MongoDB   | localhost:3000     |
| Staging     | develop   | MongoDB Preview | preview.vercel.app |
| Production  | main      | MongoDB Atlas   | seu-dominio.com    |
