// Tipos compartilhados para Estudante e estruturas relacionadas
// Mantém alinhado com prisma/schema.prisma

export interface EquipePedagogicaMembro {
  id: string;
  nome?: string; // pode vir vazio do wizard
  funcao?: string;
  contato?: string;
}

export interface AvaliacaoResumo {
  id: string;
  data: string; // Date ISO string vinda do backend
  descricao: string;
  avaliador?: {
    nome?: string;
    cargo?: string;
  } | null;
}

export interface Estudante {
  id: string;
  criado?: string; // Date ISO
  criadoPor?: string;
  criadoPorNome?: string | null; // Nome do usuário que criou
  atualizado?: string; // Date ISO
  atualizadoPor?: string;
  atualizadoPorNome?: string | null; // Nome do usuário que atualizou
  isActive: boolean;
  nome: string;
  idade: number;
  matricula: string;
  email?: string | null;
  telefone?: string | null;
  yearSchooling: number;
  turma?: string | null;
  curso?: string | null;
  isSpecialNeeds: boolean;
  specialNeedsDetails?: string | null;
  // Planejamento de Acessibilidade
  apoioEducacional: string[]; // lista de seleções
  apoioOutros?: string | null;
  equipePedagogica?: EquipePedagogicaMembro[] | null;
  objetivosAvaliacao?: string | null;
  conhecimentoEstudante?: string | null;
  conhecimentoMultiplasFormas?: string | null;
  conhecimentoDescricao?: string | null;
  planificacaoDescricao?: string | null;
  intervencaoPreliminar?: string | null;
  intervencaoCompreensiva?: string | null;
  intervencaoTransicional?: string | null;
  observacoes?: string | null;
  // Relacionamentos simplificados
  avaliacoes?: AvaliacaoResumo[];
}

// Tipo para payload de criação/atualização (PUT) - sem campos de auditoria
export type EstudanteInput = Omit<
  Estudante,
  | "id"
  | "criado"
  | "criadoPor"
  | "atualizado"
  | "atualizadoPor"
  | "isActive"
  | "avaliacoes"
>;
