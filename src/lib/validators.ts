/**
 * Valida se um CPF é válido
 * @param cpf - CPF a ser validado (com ou sem formatação)
 * @returns true se o CPF for válido, false caso contrário
 */
export function validarCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cpfLimpo = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cpfLimpo.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1+$/.test(cpfLimpo)) {
    return false;
  }

  // Valida o primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += Number.parseInt(cpfLimpo.charAt(i), 10) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== Number.parseInt(cpfLimpo.charAt(9), 10)) {
    return false;
  }

  // Valida o segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += Number.parseInt(cpfLimpo.charAt(i), 10) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== Number.parseInt(cpfLimpo.charAt(10), 10)) {
    return false;
  }

  return true;
}

/**
 * Formata um CPF para o padrão XXX.XXX.XXX-XX
 * @param cpf - CPF a ser formatado (apenas números)
 * @returns CPF formatado ou string vazia se inválido
 */
export function formatarCPF(cpf: string): string {
  const cpfLimpo = cpf.replace(/\D/g, '');

  if (cpfLimpo.length !== 11) {
    return cpf;
  }

  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Mascara parcialmente um CPF para exibição (privacidade)
 * Mantém os 3 primeiros dígitos e os 2 últimos, ocultando o meio.
 * Exemplo: 123.456.789-00 => 123.***.***-00
 * Aceita CPF com ou sem formatação; se não tiver 11 dígitos, retorna original.
 * @param cpf - CPF completo
 * @returns CPF mascarado
 */
export function mascararCPF(cpf: string): string {
  const limpo = cpf.replace(/\D/g, '');
  if (limpo.length !== 11) return cpf; // não altera se formato inesperado
  const inicio = limpo.slice(0, 3);
  const fim = limpo.slice(-2);
  return `${inicio}.***.***-${fim}`;
}

/**
 * Remove a formatação de um CPF
 * @param cpf - CPF formatado
 * @returns CPF apenas com números
 */
export function limparCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Valida se um email é válido (formato básico)
 * @param email - Email a ser validado
 * @returns true se o email for válido, false caso contrário
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida se uma senha atende aos requisitos mínimos
 * @param senha - Senha a ser validada
 * @returns Objeto com resultado da validação e mensagem de erro
 */
export function validarSenha(senha: string): {
  valida: boolean;
  mensagem?: string;
} {
  if (senha.length < 6) {
    return {
      valida: false,
      mensagem: 'A senha deve ter no mínimo 6 caracteres',
    };
  }

  return { valida: true };
}

// ========== Validadores Zod ==========
import { z } from 'zod';

/**
 * Schema Zod para validação de CPF
 * Uso: z.string().refine(validarCPF, { message: 'CPF inválido' })
 */
export const cpfSchema = z
  .string()
  .min(11, 'CPF deve ter 11 dígitos')
  .max(14, 'CPF inválido')
  .refine(
    (value) => {
      const limpo = value.replace(/\D/g, '');
      return limpo.length === 11 && validarCPF(limpo);
    },
    { message: 'CPF inválido' },
  );

/**
 * Schema Zod para validação de email
 */
export const emailSchema = z.string().email('Email inválido');

/**
 * Schema Zod para validação de senha
 */
export const senhaSchema = z
  .string()
  .min(6, 'A senha deve ter no mínimo 6 caracteres');
