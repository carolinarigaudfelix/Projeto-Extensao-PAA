'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Estudante } from '@/types/estudante';

export default function NovaAvaliacaoPage() {
  const searchParams = useSearchParams();
  const alunoId = searchParams.get('aluno');

  const [form, setForm] = useState({
    estudanteId: alunoId || '',
    avaliadorId: '',
    data: new Date().toISOString().slice(0, 10),
    descricao: '',
    evolucao: '',
    dificuldades: '',
    periodoReavaliacao: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [avaliadores, setAvaliadores] = useState<
    { id: string; nome: string }[]
  >([]);
  const router = useRouter();

  // Carregar estudantes e avaliadores ao montar
  useEffect(() => {
    fetch('/api/alunos?includeInactive=false')
      .then((r) => r.json())
      .then(setEstudantes)
      .catch(console.error);

    fetch('/api/usuarios')
      .then((r) => r.json())
      .then((data) => {
        // Filtrar apenas usuários ativos
        const pedagogos = data.filter(
          (u: { tipo: string; isActive: boolean }) =>
            (u.tipo === 'PEDAGOGO' ||
              u.tipo === 'PROFESSOR' ||
              u.tipo === 'COORDENADOR') &&
            u.isActive,
        );
        setAvaliadores(pedagogos);
      })
      .catch(console.error);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...form,
        periodoReavaliacao: form.periodoReavaliacao
          ? parseInt(form.periodoReavaliacao, 10)
          : undefined,
      };

      const res = await fetch('/api/avaliacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao criar avaliação');
      }

      setSuccess('Avaliação criada com sucesso!');
      setTimeout(() => {
        if (alunoId) {
          router.push(`/dashboard/alunos/${alunoId}`);
        } else {
          router.push('/dashboard/avaliacoes');
        }
      }, 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro inesperado');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box p={2} maxWidth={700} mx="auto">
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Nova Avaliação
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom mb={3}>
        Registre uma nova avaliação do aluno
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              select
              label="Estudante *"
              name="estudanteId"
              value={form.estudanteId}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              disabled={!!alunoId}
            >
              {estudantes.length === 0 ? (
                <MenuItem disabled>Carregando...</MenuItem>
              ) : (
                estudantes.map((e) => (
                  <MenuItem key={e.id} value={e.id}>
                    {e.nome} - {e.matricula}
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              select
              label="Avaliador *"
              name="avaliadorId"
              value={form.avaliadorId}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            >
              {avaliadores.length === 0 ? (
                <MenuItem disabled>Carregando...</MenuItem>
              ) : (
                avaliadores.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.nome}
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              label="Data da Avaliação *"
              name="data"
              type="date"
              value={form.data}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Descrição da Avaliação *"
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              multiline
              minRows={3}
              placeholder="Descreva os objetivos e atividades realizadas nesta avaliação..."
            />

            <TextField
              label="Evolução do Aluno"
              name="evolucao"
              value={form.evolucao}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              minRows={3}
              placeholder="Descreva os progressos observados..."
            />

            <TextField
              label="Dificuldades Identificadas"
              name="dificuldades"
              value={form.dificuldades}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              minRows={3}
              placeholder="Descreva as dificuldades encontradas pelo aluno..."
            />

            <TextField
              label="Período para Reavaliação (dias)"
              name="periodoReavaliacao"
              type="number"
              value={form.periodoReavaliacao}
              onChange={handleChange}
              fullWidth
              margin="normal"
              placeholder="Ex: 30, 60, 90..."
              helperText="Número de dias até a próxima reavaliação recomendada"
              inputProps={{ min: 1 }}
            />

            {error && (
              <Card
                variant="outlined"
                sx={{ mt: 2, borderColor: 'error.light' }}
              >
                <CardContent>
                  <Typography variant="body2" color="error.main">
                    {error}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {success && (
              <Card
                variant="outlined"
                sx={{ mt: 2, borderColor: 'success.light' }}
              >
                <CardContent>
                  <Typography variant="body2" color="success.main">
                    {success}
                  </Typography>
                </CardContent>
              </Card>
            )}

            <Box mt={3} display="flex" gap={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
                size="large"
              >
                {saving ? <CircularProgress size={18} /> : 'Salvar Avaliação'}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => router.back()}
                disabled={saving}
                size="large"
              >
                Cancelar
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
