SHELL := /bin/bash
NPM := source ~/.nvm/nvm.sh && npm

.PHONY: all help setup dev build start lint format clean db-push db-gen prisma-studio

all: help

help:
	@echo "🎓 Makefile do Projeto de Extensão PAA"
	@echo ""
	@echo "Comandos disponíveis:"
	@echo "  setup    - Configura o projeto (instala dependências e gera cliente Prisma)"
	@echo "  dev      - Inicia o servidor Next.js em modo desenvolvimento"
	@echo "  build    - Compila o projeto para produção"
	@echo "  start    - Inicia o servidor Next.js em modo produção"
	@echo "  lint     - Executa a verificação de código"
	@echo "  format   - Formata o código usando Biome"
	@echo "  clean    - Remove arquivos de build e dependências"
	@echo "  db-push  - Sincroniza o schema Prisma com o banco de dados"
	@echo "  db-gen   - Gera o cliente Prisma"

setup:
	@echo "📦 Instalando dependências..."
	@$(NPM) install
	@$(NPM) run prisma:generate
	@echo "✅ Projeto configurado com sucesso!"

dev: db-gen
	@echo "🚀 Iniciando servidor Next.js..."
	@$(NPM) run dev

build: db-gen
	@echo "🔨 Compilando projeto..."
	@$(NPM) run build

start:
	@echo "🌟 Iniciando servidor Next.js em produção..."
	@$(NPM) start

lint:
	@echo "🔍 Verificando código..."
	@$(NPM) run lint

format:
	@echo "✨ Formatando código..."
	@npx @biomejs/biome format --write .
	@npx @biomejs/biome check --write .

clean:
	@echo "🧹 Limpando arquivos de build e dependências..."
	@rm -rf .next node_modules .prisma prisma/generated package-lock.json

db-push:
	@echo "🔄 Sincronizando schema Prisma com o banco de dados..."
	@$(NPM) run prisma:push
	@echo "✅ Schema sincronizado com sucesso!"

db-gen:
	@echo "⚙️  Gerando cliente Prisma..."
	@$(NPM) run prisma:generate
	@echo "✅ Cliente Prisma gerado com sucesso!"

prisma-studio:
	@echo "🛠️ Iniciando Prisma Studio..."
	@$(NPM) exec prisma studio


next-build:
	@echo "🔧 Construindo Next.js..."
	@$(NPM) exec next build
	@echo "✅ Next.js construído com sucesso!"

biome-check:
	@echo "🔧 Verificando código com Biome..."
	@$(NPM) exec @biomejs/biome lint .
	@echo "✅ Verificação concluída!"