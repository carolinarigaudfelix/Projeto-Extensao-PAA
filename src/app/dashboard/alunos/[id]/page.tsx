'use client';

import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Skeleton,
  Typography,
} from '@mui/material';
import NextLink from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRoleGuard } from '@/lib/route-guard';

interface Estudante {
  id: string;
  nome: string;
  idade: number;
  matricula: string;
  email?: string;
  telefone?: string;
  yearSchooling: number;
  turma?: string;
  curso?: string;
  isSpecialNeeds: boolean;
  specialNeedsDetails?: string | null;
  criado?: string;
  atualizado?: string;
}

export default function DetalheAlunoPage() {
  const {
    isLoading: authLoading,
    isAuthenticated,
    hasRole,
  } = useRoleGuard(['ADMIN', 'COORDENADOR', 'PROFESSOR', 'PEDAGOGO']);
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [aluno, setAluno] = useState<Estudante | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasRole) return;

    async function loadAluno() {
      try {
        const res = await fetch(`/api/alunos/${id}`);
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setError(j.message || 'Falha ao carregar aluno');
          setLoading(false);
          return;
        }
        const data: Estudante = await res.json();
        setAluno(data);
        setLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro inesperado');
        setLoading(false);
      }
    }

    loadAluno();
  }, [id, hasRole]);

  if (authLoading)
    return (
      <Typography variant="body2" color="text.secondary">
        Carregando...
      </Typography>
    );
  if (!isAuthenticated)
    return (
      <Typography color="error">Você precisa estar autenticado.</Typography>
    );
  if (!hasRole) return <Typography color="error">Acesso restrito.</Typography>;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} />
      </Container>
    );
  }

  if (error || !aluno) {
    return (
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Card variant="outlined" sx={{ borderColor: 'error.light' }}>
          <CardContent>
            <Typography variant="subtitle2" color="error" gutterBottom>
              Erro
            </Typography>
            <Typography variant="body2" color="error.main">
              {error || 'Aluno não encontrado'}
            </Typography>
          </CardContent>
        </Card>
        <Box mt={2}>
          <Button
            variant="outlined"
            onClick={() => router.push('/dashboard/alunos')}
          >
            Voltar para lista
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {aluno.nome}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Matrícula: {aluno.matricula}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            component={NextLink}
            href={`/dashboard/alunos/${id}/editar`}
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push('/dashboard/alunos')}
          >
            Voltar
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Informações Pessoais
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box display="flex" flexWrap="wrap" gap={3}>
            <Box flex="1 1 200px">
              <Typography variant="caption" color="text.secondary">
                Nome
              </Typography>
              <Typography variant="body1">{aluno.nome}</Typography>
            </Box>
            <Box flex="1 1 200px">
              <Typography variant="caption" color="text.secondary">
                Idade
              </Typography>
              <Typography variant="body1">{aluno.idade} anos</Typography>
            </Box>
            <Box flex="1 1 200px">
              <Typography variant="caption" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{aluno.email || '-'}</Typography>
            </Box>
            <Box flex="1 1 200px">
              <Typography variant="caption" color="text.secondary">
                Telefone
              </Typography>
              <Typography variant="body1">{aluno.telefone || '-'}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Informações Acadêmicas
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box display="flex" flexWrap="wrap" gap={3}>
            <Box flex="1 1 200px">
              <Typography variant="caption" color="text.secondary">
                Matrícula
              </Typography>
              <Typography variant="body1">{aluno.matricula}</Typography>
            </Box>
            <Box flex="1 1 200px">
              <Typography variant="caption" color="text.secondary">
                Ano Escolar
              </Typography>
              <Typography variant="body1">
                {aluno.yearSchooling}º ano
              </Typography>
            </Box>
            <Box flex="1 1 200px">
              <Typography variant="caption" color="text.secondary">
                Turma
              </Typography>
              <Typography variant="body1">{aluno.turma || '-'}</Typography>
            </Box>
            <Box flex="1 1 200px">
              <Typography variant="caption" color="text.secondary">
                Curso
              </Typography>
              <Typography variant="body1">{aluno.curso || '-'}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Necessidades Especiais
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box mb={2}>
            <Chip
              label={
                aluno.isSpecialNeeds
                  ? 'Possui necessidades especiais'
                  : 'Não possui necessidades especiais'
              }
              color={aluno.isSpecialNeeds ? 'warning' : 'default'}
              variant={aluno.isSpecialNeeds ? 'filled' : 'outlined'}
            />
          </Box>
          {aluno.isSpecialNeeds && aluno.specialNeedsDetails && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Detalhes
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {aluno.specialNeedsDetails}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
