// Tipo compartilhado para Usuario
// Mantém alinhado com prisma/schema.prisma (campos relevantes)

export interface Usuario {
  id: string;
  nome: string;
  cpf: string; // sempre armazenado sem máscara
  email: string;
  telefone?: string | null; // caso futuro
  tipo: 'ADMIN' | 'COORDENADOR' | 'PROFESSOR' | 'PEDAGOGO';
  criado?: string; // ISO
  criadoPor?: string;
  criadoPorNome?: string | null; // Nome do usuário que criou
  atualizado?: string; // ISO
  atualizadoPor?: string;
  atualizadoPorNome?: string | null; // Nome do usuário que atualizou
  isActive?: boolean;
}

export interface UsuarioInput {
  nome: string;
  cpf: string; // sem máscara
  email: string;
  senha: string;
  tipo: 'ADMIN' | 'COORDENADOR' | 'PROFESSOR' | 'PEDAGOGO';
}
