'use client';

import { useRoleGuard } from '@/lib/route-guard';
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
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface UsuarioDetalhe {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  cpf: string;
  atualizado: string;
  isActive: boolean;
}

const tiposValidos = ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'PEDAGOGO'] as const;

export default function EditarUsuarioPage() {
  const { isLoading, isAuthenticated, hasRole } = useRoleGuard(['ADMIN']);
  const params = useParams();
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const userId = Array.isArray(params?.id)
    ? params.id[0]
    : (params?.id as string | undefined);

  const carregarUsuario = useCallback(async () => {
    if (!userId) return;
    if (!hasRole) return;
    try {
      const res = await fetch(`/api/usuarios/${userId}`);
      if (!res.ok) throw new Error('Falha ao carregar usuário');
      const data = await res.json();
      setUsuario(data);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }, [userId, hasRole]);

  useEffect(() => {
    carregarUsuario();
  }, [carregarUsuario]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId) return;
    if (!usuario) return;
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const formData = new FormData(event.currentTarget);
      const entries = Object.fromEntries(formData.entries());
      const payload: Record<string, unknown> = {};
      if (entries.nome && entries.nome !== usuario.nome)
        payload.nome = entries.nome;
      if (entries.email && entries.email !== usuario.email)
        payload.email = entries.email;
      if (entries.tipo && entries.tipo !== usuario.tipo)
        payload.tipo = entries.tipo;
      if (entries.cpf && entries.cpf !== usuario.cpf) payload.cpf = entries.cpf;

      const res = await fetch(`/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || 'Falha ao salvar');
        return;
      }
      setSuccess('Usuário atualizado com sucesso');
      carregarUsuario();
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
  if (loading)
    return (
      <Typography variant="body2" color="text.secondary">
        Carregando usuário...
      </Typography>
    );
  if (!usuario) return <Alert severity="error">Usuário não encontrado.</Alert>;

  return (
    <Paper sx={{ maxWidth: 600, p: 3 }} elevation={1}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Editar Usuário
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
        onSubmit={onSubmit}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <TextField
          name="nome"
          label="Nome"
          defaultValue={usuario.nome}
          required
          fullWidth
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          defaultValue={usuario.email}
          required
          fullWidth
        />
        <TextField
          name="cpf"
          label="CPF"
          defaultValue={usuario.cpf}
          required
          fullWidth
          inputProps={{ pattern: '[0-9]{11}', inputMode: 'numeric' }}
          helperText="11 dígitos (apenas números)"
        />
        <TextField
          name="tipo"
          label="Tipo"
          defaultValue={usuario.tipo}
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
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Salvar'}
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
