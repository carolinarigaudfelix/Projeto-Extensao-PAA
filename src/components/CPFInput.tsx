'use client';

import { TextField, type TextFieldProps } from '@mui/material';
import { forwardRef, useState } from 'react';
import { formatarCPF, validarCPF } from '@/lib/validators';

type CPFInputProps = Omit<TextFieldProps, 'type' | 'inputMode'> & {
  onCPFChange?: (cpf: string, valido: boolean) => void;
};

/**
 * Campo de input para CPF com validação automática e formatação
 */
export const CPFInput = forwardRef<HTMLInputElement, CPFInputProps>(
  ({ onCPFChange, onChange, value, ...props }, ref) => {
    const [erro, setErro] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let valor = e.target.value.replace(/\D/g, ''); // Remove não-numéricos

      // Limita a 11 dígitos
      if (valor.length > 11) {
        valor = valor.slice(0, 11);
      }

      // Formata o CPF conforme digita
      const valorFormatado = formatarCPF(valor);
      e.target.value = valorFormatado;

      // Valida apenas quando tiver 11 dígitos
      if (valor.length === 11) {
        const valido = validarCPF(valor);
        setErro(valido ? '' : 'CPF inválido');
        onCPFChange?.(valor, valido);
      } else {
        setErro('');
        onCPFChange?.(valor, false);
      }

      onChange?.(e);
    };

    return (
      <TextField
        {...props}
        ref={ref}
        value={value}
        onChange={handleChange}
        error={!!erro || props.error}
        helperText={erro || props.helperText}
        inputProps={{
          ...props.inputProps,
          maxLength: 14, // XXX.XXX.XXX-XX
        }}
        placeholder="000.000.000-00"
      />
    );
  },
);

CPFInput.displayName = 'CPFInput';
