# 📊 Sistema de Avaliações - Documentação

## Visão Geral

O sistema de avaliações permite registrar e acompanhar o progresso dos alunos ao longo do tempo, com campos detalhados para evolução, dificuldades e planejamento de reavaliações.

## Funcionalidades Implementadas

### ✅ 1. Visualização de Avaliações na Página do Aluno

**Local:** `/dashboard/alunos/[id]`

A página de detalhes do aluno agora inclui uma seção completa de avaliações mostrando:

- **Contador de avaliações** - Número total de avaliações registradas
- **Botão "Nova Avaliação"** - Acesso rápido para registrar nova avaliação
- **Tabela de avaliações** com as seguintes colunas:
  - Data da avaliação
  - Nome e cargo do avaliador
  - Descrição (com tooltip para texto completo)
  - Evolução observada
  - Dificuldades identificadas
  - Próxima reavaliação (com indicador visual de vencimento)

**Recursos visuais:**
- Chip colorido para próxima reavaliação (vermelho se vencida, padrão se futura)
- Skeleton loading enquanto carrega
- Mensagem amigável quando não há avaliações
- Textos truncados com tooltip

### ✅ 2. Formulário de Nova Avaliação Completo

**Local:** `/dashboard/avaliacoes/novo`

O formulário foi completamente reformulado com todos os campos necessários:

#### Campos Obrigatórios:
- **Estudante** - Seleção do aluno (pré-preenchido se vier da página do aluno)
- **Avaliador** - Profissional que realizou a avaliação
- **Data da Avaliação** - Data em que foi realizada
- **Descrição** - Objetivos e atividades realizadas

#### Campos Opcionais:
- **Evolução do Aluno** - Progressos observados (multiline)
- **Dificuldades Identificadas** - Obstáculos encontrados (multiline)
- **Período para Reavaliação** - Dias até próxima avaliação recomendada

#### Melhorias UX:
- Design em card com melhor organização
- Placeholders informativos em cada campo
- Validação de campos obrigatórios
- Mensagens de erro e sucesso claras
- Carregamento dos dados de estudantes e avaliadores ativos
- Redirecionamento inteligente após salvar (volta para o aluno ou para lista)

### ✅ 3. Dashboard de Avaliações Aprimorado

**Local:** `/dashboard/avaliacoes`

A página principal de avaliações foi otimizada:

#### Melhorias:
- **Header com botão "Nova Avaliação"** - Acesso rápido
- **Descrição contextual** - "Acompanhamento de avaliações e próximas reavaliações"
- **Tabela simplificada** - Removidas colunas de auditoria desnecessárias
- **Link para detalhes do aluno** - Clique no nome do aluno
- **Indicadores visuais:**
  - Chip verde para reavaliação futura
  - Chip vermelho para reavaliação vencida
  - Chip de status ativo/inativo do aluno
- **Textos truncados** - Com tooltip para conteúdo completo
- **Loading state** - CircularProgress centralizado

#### Colunas da Tabela:
1. Aluno (com link)
2. Matrícula
3. Última Avaliação
4. Evolução
5. Dificuldades
6. Próxima Reavaliação (com indicador visual)
7. Status (Ativo/Inativo)
8. Ações (Botão "Nova Avaliação")

## Estrutura de Dados

### Modelo de Avaliação (Prisma)

```prisma
model Avaliacao {
  id                 String    @id @default(auto()) @map("_id") @db.ObjectId
  criado             DateTime  @default(now())
  criadoPor          String
  atualizado         DateTime  @updatedAt
  atualizadoPor      String
  isActive           Boolean   @default(true)

  // Campos principais
  data               DateTime
  descricao          String
  evolucao           String?
  dificuldades       String?
  periodoReavaliacao Int?      // em dias

  // Relacionamentos
  estudante          Estudante @relation(fields: [estudanteId], references: [id])
  estudanteId        String    @db.ObjectId
  avaliador          MembroPedagogico? @relation(fields: [avaliadorId], references: [id])
  avaliadorId        String?   @db.ObjectId
}
```

## Fluxo de Uso

### Cenário 1: Nova Avaliação a partir do Aluno
1. Acesse `/dashboard/alunos/[id]`
2. Role até a seção "Avaliações"
3. Clique em "Nova Avaliação"
4. Formulário já vem com o aluno pré-selecionado
5. Preencha os campos e salve
6. Sistema redireciona de volta para a página do aluno

### Cenário 2: Nova Avaliação a partir do Dashboard
1. Acesse `/dashboard/avaliacoes`
2. Identifique aluno que precisa de avaliação (veja data de próxima reavaliação)
3. Clique em "Nova Avaliação" na linha do aluno
4. Preencha o formulário
5. Sistema redireciona para a página do aluno

### Cenário 3: Consultar Histórico de Avaliações
1. Acesse `/dashboard/alunos/[id]`
2. Role até a seção "Avaliações"
3. Visualize todas as avaliações em ordem cronológica
4. Use tooltips para ver textos completos
5. Identifique próxima reavaliação recomendada

## Cálculo de Próxima Reavaliação

A próxima reavaliação é calculada automaticamente:

```typescript
const proximaData = new Date(dataAvaliacao);
proximaData.setDate(proximaData.getDate() + periodoReavaliacao);
```

**Indicadores visuais:**
- ✅ **Verde/Padrão**: Reavaliação futura
- ❌ **Vermelho**: Reavaliação vencida (data já passou)

## APIs Utilizadas

### GET `/api/avaliacoes/aluno/[id]`
Busca todas as avaliações de um aluno específico.

**Resposta:**
```json
[
  {
    "id": "...",
    "data": "2025-01-15T00:00:00.000Z",
    "descricao": "Avaliação de leitura...",
    "evolucao": "Progresso significativo...",
    "dificuldades": "Dificuldade em...",
    "periodoReavaliacao": 30,
    "avaliador": {
      "nome": "Prof. João",
      "cargo": "Pedagogo"
    }
  }
]
```

### POST `/api/avaliacoes`
Cria nova avaliação.

**Payload:**
```json
{
  "estudanteId": "...",
  "avaliadorId": "...",
  "data": "2025-01-15",
  "descricao": "Descrição da avaliação",
  "evolucao": "Evolução observada",
  "dificuldades": "Dificuldades encontradas",
  "periodoReavaliacao": 30
}
```

## Boas Práticas

### Para Avaliadores:

1. **Seja específico na descrição** - Descreva objetivos, atividades e metodologia
2. **Documente progressos** - Use o campo "Evolução" para registrar avanços
3. **Identifique dificuldades** - Seja claro sobre obstáculos encontrados
4. **Planeje reavaliações** - Use períodos adequados (30, 60, 90 dias)
5. **Mantenha histórico** - Avaliações regulares ajudam a acompanhar evolução

### Para o Sistema:

1. **Filtros inteligentes** - Dashboard mostra apenas alunos ativos por padrão
2. **Ordenação cronológica** - Avaliações mais recentes primeiro
3. **Validação de dados** - Campos obrigatórios impedem registros incompletos
4. **UX otimizada** - Redirecionamentos e pré-preenchimentos facilitam uso

## Melhorias Futuras

- [ ] Edição de avaliações existentes
- [ ] Exclusão de avaliações (soft delete)
- [ ] Filtros por período/avaliador na lista
- [ ] Gráficos de evolução do aluno
- [ ] Exportação de relatórios em PDF
- [ ] Notificações de reavaliações vencidas
- [ ] Comparação entre avaliações
- [ ] Anexos (documentos, imagens)
- [ ] Comentários/observações adicionais
- [ ] Sistema de tags/categorias
