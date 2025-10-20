SHELL := /bin/bash
NPM := source ~/.nvm/nvm.sh && npm

.PHONY: all help setup dev build start lint format clean prisma-push prisma-generate

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

dev: prisma-generate
	@echo "🚀 Iniciando servidor Next.js..."
	@$(NPM) run dev

build: prisma-generate
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
	@$(NPM) exec @biomejs/biome format --write .
	@$(NPM) exec @biomejs/biome lint --apply .

clean:
	@echo "🧹 Limpando arquivos de build e dependências..."
	@rm -rf .next node_modules .prisma prisma/generated package-lock.json

prisma-studio:
	@echo "🛠️ Iniciando Prisma Studio..."
	@$(NPM) exec prisma studio


next-build:
	@echo "🔧 Construindo Next.js..."
	@$(NPM) exec next build
	@echo "✅ Next.js construído com sucesso!"