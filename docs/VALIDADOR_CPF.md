# Validador de CPF - Guia de Uso

Este projeto inclui um validador de CPF completo com múltiplas formas de uso.

## 📦 Arquivos Criados

- `src/lib/validators.ts` - Funções de validação e schemas Zod
- `src/components/CPFInput.tsx` - Componente React com validação automática

## 🔧 Funções Disponíveis

### 1. Validação Básica

```typescript
import { validarCPF } from '@/lib/validators';

// Aceita CPF com ou sem formatação
validarCPF('123.456.789-09'); // true/false
validarCPF('12345678909'); // true/false
```

### 2. Formatação

```typescript
import { formatarCPF, limparCPF } from '@/lib/validators';

// Formatar CPF
formatarCPF('12345678909'); // "123.456.789-09"

// Remover formatação
limparCPF('123.456.789-09'); // "12345678909"
```

### 3. Validação com Zod

```typescript
import { z } from 'zod';
import { cpfSchema } from '@/lib/validators';

const schema = z.object({
  nome: z.string().min(3),
  cpf: cpfSchema, // Valida automaticamente
});

// Uso em formulários
const resultado = schema.safeParse({
  nome: 'João Silva',
  cpf: '123.456.789-09',
});
```

## 🎨 Componente CPFInput

### Uso Básico

```tsx
import { CPFInput } from '@/components/CPFInput';

function MeuFormulario() {
  return (
    <CPFInput
      label="CPF"
      name="cpf"
      required
      fullWidth
    />
  );
}
```

### Com Validação Customizada

```tsx
import { CPFInput } from '@/components/CPFInput';
import { useState } from 'react';

function FormularioCadastro() {
  const [cpf, setCpf] = useState('');
  const [cpfValido, setCpfValido] = useState(false);

  return (
    <CPFInput
      label="CPF do Aluno"
      name="cpf"
      value={cpf}
      onCPFChange={(cpfLimpo, valido) => {
        setCpf(cpfLimpo);
        setCpfValido(valido);
      }}
      required
      fullWidth
    />
  );
}
```

### Com React Hook Form

```tsx
import { CPFInput } from '@/components/CPFInput';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { cpfSchema } from '@/lib/validators';

const schema = z.object({
  cpf: cpfSchema,
});

function FormularioComHook() {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="cpf"
        control={control}
        render={({ field, fieldState }) => (
          <CPFInput
            {...field}
            label="CPF"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            fullWidth
          />
        )}
      />
    </form>
  );
}
```

## ✅ Características

- ✓ Validação matemática completa (dígitos verificadores)
- ✓ Rejeita CPFs com todos os dígitos iguais (111.111.111-11)
- ✓ Formatação automática durante digitação
- ✓ Aceita entrada com ou sem formatação
- ✓ Integração com Zod para validação de schemas
- ✓ Componente React com feedback visual
- ✓ TypeScript com tipos completos
- ✓ Mensagens de erro claras

## 📝 Exemplos de CPFs

### Válidos (para teste)
- 123.456.789-09
- 111.444.777-35

### Inválidos
- 111.111.111-11 (todos iguais)
- 123.456.789-00 (dígito verificador errado)
- 12345678 (incompleto)

## 🔐 Validação no Backend

```typescript
// Em rotas API (src/app/api/alunos/route.ts)
import { validarCPF, limparCPF } from '@/lib/validators';

export async function POST(req: Request) {
  const body = await req.json();
  const cpf = limparCPF(body.cpf);

  if (!validarCPF(cpf)) {
    return Response.json(
      { error: 'CPF inválido' },
      { status: 400 }
    );
  }

  // Continuar com o cadastro...
}
```
