# Identidade e Planos (Rascunho)

Este documento registra diretrizes e pendências relacionadas à identidade do produto e à definição de planos/preços.

## Direção de Identidade

- Solicitação: “seguir por essa frente de identidade”.
- Próximos passos:
  - Definir naming, paleta e elementos visuais.
  - Levantar necessidades de ajustes no tema MUI (cores, tipografia) em `src/app/theme.ts`.
  - Atualizar metadados (`src/app/layout.tsx`) e assets públicos quando a identidade estiver aprovada.

## Tabela de Valores (Placeholder)

- Aguardando tabela de valores para os planos.
- Estrutura sugerida (exemplo):
  - Gratuito: até N usuários (definir), limites de alunos/avaliações.
  - Pro: limites ampliados, suporte prioritário, impressão avançada com logo.
  - Enterprise: sem limites, SSO, auditoria.

Quando a tabela for aprovada, implementar página pública com detalhes (ex.: `/precos`) e toggles no backend (feature flags/envs) para “quantitativo de usuários contemplados na versão gratuita”.

## Observações

- Versão piloto: avaliar impacto de limites e habilitação de impressão.
- Guardrails já aplicados: somente ADMIN pode desativar alunos; impressão focada no preenchido foi implementada.
