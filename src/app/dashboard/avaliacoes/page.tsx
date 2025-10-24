'use client';

import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import type { AvaliacaoResumo, Estudante } from '@/types/estudante';

export default function AvaliacoesPage() {
  const [alunos, setAlunos] = useState<Estudante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAlunos() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/alunos?includeInactive=false');
        if (!res.ok) throw new Error('Falha ao buscar alunos');
        const data = await res.json();
        setAlunos(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro inesperado');
      } finally {
        setLoading(false);
      }
    }
    fetchAlunos();
  }, []);

  return (
    <Box p={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Situação dos Alunos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Acompanhamento de avaliações e próximas reavaliações
          </Typography>
        </Box>
        <Button
          component={NextLink}
          href="/dashboard/avaliacoes/novo"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Nova Avaliação
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Card variant="outlined" sx={{ mb: 2, borderColor: 'error.light' }}>
          <CardContent>
            <Typography variant="subtitle2" color="error" gutterBottom>
              Erro
            </Typography>
            <Typography variant="body2" color="error.main">
              {error}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Aluno</TableCell>
                <TableCell>Matrícula</TableCell>
                <TableCell>Última Avaliação</TableCell>
                <TableCell>Evolução</TableCell>
                <TableCell>Dificuldades</TableCell>
                <TableCell>Próxima Reavaliação</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alunos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box py={4}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhum aluno encontrado.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                alunos.map((aluno) => {
                  const ultima:
                    | (AvaliacaoResumo & {
                        periodoReavaliacao?: number;
                        evolucao?: string;
                        dificuldades?: string;
                      })
                    | null =
                    aluno.avaliacoes && aluno.avaliacoes.length > 0
                      ? aluno.avaliacoes[0]
                      : null;
                  let proxima = '-';
                  let isVencida = false;
                  if (ultima?.periodoReavaliacao && ultima?.data) {
                    const prox = new Date(ultima.data);
                    prox.setDate(
                      prox.getDate() + (ultima.periodoReavaliacao || 0),
                    );
                    proxima = prox.toLocaleDateString('pt-BR');
                    isVencida = prox < new Date();
                  }
                  return (
                    <TableRow key={aluno.id}>
                      <TableCell>
                        <Button
                          component={NextLink}
                          href={`/dashboard/alunos/${aluno.id}`}
                          variant="text"
                          size="small"
                          sx={{ textTransform: 'none' }}
                        >
                          {aluno.nome}
                        </Button>
                      </TableCell>
                      <TableCell>{aluno.matricula}</TableCell>
                      <TableCell>
                        {ultima
                          ? new Date(ultima.data).toLocaleDateString('pt-BR')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={ultima?.evolucao || '-'}
                        >
                          {ultima?.evolucao || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={ultima?.dificuldades || '-'}
                        >
                          {ultima?.dificuldades || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {proxima !== '-' ? (
                          <Chip
                            label={proxima}
                            size="small"
                            color={isVencida ? 'error' : 'success'}
                            variant="filled"
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={aluno.isActive ? 'Ativo' : 'Inativo'}
                          size="small"
                          color={aluno.isActive ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          component={NextLink}
                          variant="outlined"
                          size="small"
                          href={`/dashboard/avaliacoes/novo?aluno=${aluno.id}`}
                        >
                          Nova Avaliação
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
