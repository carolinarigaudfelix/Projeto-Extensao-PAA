'use client';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CPFInput } from '@/components/CPFInput';
import { useRoleGuard } from '@/lib/route-guard';
import { limparCPF, validarCPF } from '@/lib/validators';

const tiposValidos = ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'PEDAGOGO'] as const;

interface FormData {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  tipo: string;
}

export default function NovoUsuarioPage() {
  const { isLoading, isAuthenticated, hasRole } = useRoleGuard(['ADMIN']);
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    tipo: 'PROFESSOR',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cpfValido, setCpfValido] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Sanitiza e valida CPF antes de enviar
      const cpfL = limparCPF(form.cpf);
      if (!validarCPF(cpfL)) {
        setError('CPF inválido');
        return;
      }

      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cpf: cpfL }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || 'Erro ao criar usuário');
        return;
      }

      setSuccess('Usuário criado com sucesso!');
      setTimeout(() => {
        router.push('/dashboard/usuarios');
        router.refresh();
      }, 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading)
    return (
      <Typography variant="body2" color="text.secondary">
        Carregando...
      </Typography>
    );
  if (!isAuthenticated)
    return <Alert severity="error">Você precisa estar autenticado.</Alert>;
  if (!hasRole)
    return <Alert severity="error">Acesso restrito a administradores.</Alert>;

  return (
    <Paper sx={{ maxWidth: 600, p: 3 }} elevation={1}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Novo Usuário
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <Box
        component="form"
        onSubmit={handleSubmit}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <TextField
          name="nome"
          label="Nome"
          value={form.nome}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          name="senha"
          label="Senha"
          type="password"
          value={form.senha}
          onChange={handleChange}
          required
          fullWidth
          inputProps={{ minLength: 6 }}
          helperText="Mínimo 6 caracteres"
        />
        <CPFInput
          name="cpf"
          label="CPF"
          value={form.cpf}
          onChange={handleChange}
          onCPFChange={(_, v) => setCpfValido(v)}
          required
          fullWidth
          helperText="Digite o CPF (formato 000.000.000-00)"
        />
        <TextField
          name="tipo"
          label="Tipo"
          value={form.tipo}
          onChange={handleChange}
          required
          select
          fullWidth
        >
          {tiposValidos.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>
        <Box display="flex" gap={2} mt={1}>
          <Button
            type="submit"
            variant="contained"
            disabled={saving || !cpfValido}
          >
            {saving ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Criar Usuário'
            )}
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
