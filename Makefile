SHELL := /bin/bash
NPM := source ~/.nvm/nvm.sh && npm

.PHONY: all help install dev build start lint format clean

all: help

help:
	@echo "Makefile do Projeto de Extensão PAA"
	@echo ""
	@echo "Comandos disponíveis:"
	@echo "  install  - Instala as dependências do projeto"
	@echo "  dev      - Inicia o servidor de desenvolvimento"
	@echo "  build    - Compila o projeto para produção"
	@echo "  start    - Inicia o servidor em modo produção"
	@echo "  lint     - Executa a verificação de código"
	@echo "  format   - Formata o código usando Biome"
	@echo "  clean    - Remove arquivos de build e dependências"

install:
	@echo "📦 Instalando dependências..."
	@$(NPM) install

dev:
	@echo "🚀 Iniciando servidor de desenvolvimento..."
	@$(NPM) run dev

build:
	@echo "🔨 Compilando projeto..."
	@$(NPM) run build

start:
	@echo "🌟 Iniciando servidor em modo produção..."
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
	@rm -rf .next node_modules yarn.lock package-lock.json

prisma-generate:
	@echo "🔧 Gerando cliente Prisma..."
	@$(NPM) exec prisma generate
	@echo "✅ Cliente Prisma gerado com sucesso!"